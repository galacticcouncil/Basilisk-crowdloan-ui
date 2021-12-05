require("dotenv").config()
const BN = require("bn.js")
const {ApiPromise, WsProvider, Keyring} = require("@polkadot/api")
const {encodeAddress, cryptoWaitReady} = require("@polkadot/util-crypto")
const types = require("../types.js")
const {stringToU8a} = require("@polkadot/util")

const vestings = require("./data/vestings.json")
const assert = require("assert");

const ACCOUNT_SECRET = process.env.ACCOUNT_SECRET || "//Alice"
const RPC = process.env.RPC_SERVER || "ws://127.0.0.1:9988"

const amountToBN = (amount) => new BN(hdx).mul(new BN(10).pow(new BN(12)))
const bsxAddress = (pubKey) => encodeAddress(pubKey, 10041) // https://wiki.polkadot.network/docs/build-ss58-registry
const chunkify = (a, size) => Array(Math.ceil(a.length / size))
  .fill()
  .map((_, i) => a.slice(i * size, i * size + size));

async function main() {
  await cryptoWaitReady()
  const provider = new WsProvider(RPC)
  const keyring = new Keyring({type: "sr25519"})
  const api = await ApiPromise.create({
    provider: provider,
    types: types,
    typesAlias: {
      tokens: {
        AccountData: "OrmlAccountData",
      },
    },
  })

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
    api.tx.vesting.vestedTransfer(destination, schedule)
  );

  console.log("vestingSchedules generated:", vestingSchedules.length)

  const batch = api.tx.utility.batch(vestingSchedules)
  const sudo = api.tx.sudo.sudoAs(TREASURY, batch)

  const {maxBlock} = api.consts.system.blockWeights;
  const {weight} = await sudo.paymentInfo(from);
  console.log('weight of the whole batch', weight.toHuman());
  console.log('max block weight ', maxBlock.toHuman());

  const blocks = weight.div(maxBlock).toNumber() + 1;
  console.log(`batch have to be split into ${blocks} blocks`);

  const vestingsPerBlock = Math.ceil(vestingSchedules.length / blocks);
  const chunks = chunkify(vestingSchedules, vestingsPerBlock)
    .map(vestings => api.tx.sudo.sudoAs(TREASURY, api.tx.utility.batch(vestings)));

  const weights = await Promise.all(
    chunks.map(async chunk => {
      const {weight} = await chunk.paymentInfo(from);
      assert(weight.lt(maxBlock), `chunk overweight: ${weight}`);
      return weight;
    })
  );

  console.log(`chunk weight ${weights[0].toHuman()} < ${maxBlock.toHuman()}`);

  if (process.argv[2] === "test") {
    console.log('run "npm start" to send tx')
    process.exit()
  }

  console.log("sending txs")
  const sendAndWaitFinalization = tx => new Promise(resolve =>
    tx.signAndSend(from, ({status}) => {
      if (status.isInBlock) console.log('included in', status.asInBlock.toHex())
      if (status.isFinalized) resolve()
    }));

  for (let i = 0; i < chunks.length; i++) {
    console.log('batch', i);
    await sendAndWaitFinalization(chunks[i]).catch(e => {
      console.log(e);
      process.exit(1);
    });
    console.log('done')
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e)
  process.exit()
})
