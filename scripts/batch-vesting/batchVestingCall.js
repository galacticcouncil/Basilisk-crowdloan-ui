require("dotenv").config()
const BN = require("bn.js")
const {ApiPromise, WsProvider, Keyring} = require("@polkadot/api")
const {encodeAddress, cryptoWaitReady} = require("@polkadot/util-crypto")
const {stringToU8a} = require("@polkadot/util")

const vestings = require("../data/vestings.json")
const assert = require("assert");

const ACCOUNT_SECRET = process.env.ACCOUNT_SECRET || "//Alice"
const RPC = process.env.RPC_SERVER || "ws://127.0.0.1:9988"

const bsxAddress = (pubKey) => encodeAddress(pubKey, 10041) // https://wiki.polkadot.network/docs/build-ss58-registry
const chunkify = (a, size) => Array(Math.ceil(a.length / size))
  .fill()
  .map((_, i) => a.slice(i * size, i * size + size));
const filterEventsByName = (name, events) => events.filter(({event: {section, method}}) => name === `${section}.${method}`)
const sendAndWaitFinalization = ({from, tx, printEvents = []}) => new Promise(resolve =>
  tx.signAndSend(from, (receipt) => {
    let {status, events = []} = receipt;
    if (status.isInBlock) {
      console.log('included in', status.asInBlock.toHex());
      events.filter(({event: {section}}) => printEvents.includes(section))
        .forEach(({ event: { data, method, section } }) =>
          console.log(`${section}.${method}`, JSON.stringify(data)));
    }
    if (status.isFinalized) {
      console.log('finalized', status.asFinalized.toHex());
      resolve(receipt);
    }
  }));

async function main() {
  await cryptoWaitReady()
  const provider = new WsProvider(RPC)
  const keyring = new Keyring({type: "sr25519"})
  const api = await ApiPromise.create({provider});

  const [chain, nodeVersion] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.version(),
  ])
  console.log(`connected to ${RPC} (${chain} ${nodeVersion})`)

  const from = keyring.addFromUri(ACCOUNT_SECRET)
  console.log("sudo account:", bsxAddress(from.addressRaw))

  const treasuryPubKey = stringToU8a("modlpy/trsry".padEnd(32, "\0"))
  const TREASURY = bsxAddress(treasuryPubKey)
  console.log("treasury account:", TREASURY);

  const vestingSchedules = vestings.map(({destination, schedule}) =>
    api.tx.sudo.sudoAs(TREASURY, api.tx.vesting.vestedTransfer(destination, schedule))
  );

  console.log("vestingSchedules generated:", vestingSchedules.length)

  const batch = api.tx.utility.batch(vestingSchedules);

  let {maxExtrinsic: weightLimit} = api.consts.system.blockWeights.perClass.normal;
  const {weight} = await batch.paymentInfo(from);
  console.log('weight of the whole batch', weight.toHuman());
  console.log('weight limit', weightLimit.toHuman());
  weightLimit = new BN(weightLimit.toString());

  const blocks = weight.div(weightLimit).toNumber() + 1;
  console.log(`batch have to be split into ${blocks} blocks`);

  const vestingsPerBlock = Math.ceil(vestingSchedules.length / blocks);
  const chunks = chunkify(vestingSchedules, vestingsPerBlock)
    .map(vestings => api.tx.utility.batch(vestings));

  const weights = await Promise.all(
    chunks.map(async chunk => {
      const {weight} = await chunk.paymentInfo(from);
      assert(weight.lt(weightLimit), `chunk overweight: ${weight}`);
      return weight;
    })
  );

  console.log(`chunk weight ${weights[0].toHuman()}`);

  if (process.argv[2] === "test") {
    console.log('run "npm start" to send tx')
    process.exit()
  }
  const startFrom = Number(process.argv[2]) || 0;

  console.log("sending txs");
  let totalEndowed = new BN(0);
  for (let i = startFrom; i < chunks.length; i++) {
    console.log('batch', i);
    const {events} = await sendAndWaitFinalization({
      from,
      tx: chunks[i],
      //printEvents: ["utility", "sudo", "vesting"]
    }).catch(e => {
      console.log(e);
      process.exit(1);
    });
    const vestingsAdded = filterEventsByName('vesting.VestingScheduleAdded', events).length;
    assert.strictEqual(vestingsAdded, chunks[i].args[0].length, 'not all vestings added');
    const balancesEndowed = filterEventsByName('balances.Endowed', events)
      .reduce((sum, {event: {data: [_, balance]}}) => sum.add(balance), new BN(0));
    totalEndowed = totalEndowed.add(balancesEndowed);
    console.log('total vested', totalEndowed.toString());
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e)
  process.exit()
})
