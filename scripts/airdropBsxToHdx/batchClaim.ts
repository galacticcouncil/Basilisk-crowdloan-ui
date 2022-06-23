require("dotenv").config();
const BN = require("bn.js");
const { ApiPromise, WsProvider, Keyring } = require("@polkadot/api");
const { encodeAddress, cryptoWaitReady } = require("@polkadot/util-crypto");
const { stringToU8a } = require("@polkadot/util");
const assert = require("assert");
const vestings = require("./data/vestings.json");

import { DynamicVestingInfo } from './getVestingSchedules'

const ACCOUNT_SECRET = process.env.ACCOUNT_SECRET || "//Alice";
const RPC = process.env.RPC_SERVER || "ws://127.0.0.1:9988";

const chunkify = (a, size) => Array(Math.ceil(a.length / size)).fill(a).map((_, i) => a.slice(i * size, i * size + size));

const sendAndWaitFinalization = ({ from, tx, printEvents = [] }) => new Promise(resolve =>
  tx.signAndSend(from, (receipt) => {
      let { status, events = [] } = receipt;
      if (status.isInBlock) {
          console.log('included in', status.asInBlock.toHex());
          events.filter(({ event: { section } }) => printEvents.includes(section))
              .forEach(({ event: { data, method, section } }) =>
                  console.log(`${section}.${method}`, JSON.stringify(data)));
      }
      if (status.isFinalized) {
          console.log('finalized', status.asFinalized.toHex());
          resolve(receipt);
      }
  }));

async function main() {
  await performBatchClaim(vestings);
}

const performBatchClaim = async function(
  vestings: DynamicVestingInfo[]
): Promise<any> {
  await cryptoWaitReady();
  const provider = new WsProvider(RPC);
  const api = await ApiPromise.create({provider});
  const keyring = new Keyring({type: "sr25519"});
  const sendFrom = keyring.addFromUri(ACCOUNT_SECRET);

  const [chain, nodeVersion] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.version(),
  ]);

  console.log(`connected to ${RPC} (${chain} ${nodeVersion})`);

  const claims = vestings.map(({destination}) =>
    api.tx.vesting.claimFor(destination)
  );

  console.log(`${claims.length} claims generated`);

  const batch = api.tx.utility.batch(claims);

  let { maxExtrinsic: weightLimit } = api.consts.system.blockWeights.perClass.normal;
  const { weight } = await batch.paymentInfo(sendFrom);
  console.log(`Weight of the whole batch: ${weight.toHuman()}`);
  console.log(`Weight limit: ${weightLimit.toHuman()}`);

  weightLimit = new BN(weightLimit.toString());

  const blocks = weight.div(weightLimit).toNumber() + 1;
  console.log(`Batch will be split into ${blocks} blocks`);

  const claimsPerBlock = Math.ceil(claims.length / blocks);
  const chunks = chunkify(claims, claimsPerBlock)
    .map(claim_chunk => api.tx.utility.batch(claim_chunk));

  const weights = await Promise.all(
    chunks.map(async chunk => {
      const {weight} = await chunk.paymentInfo(sendFrom);
      assert(weight.lt(weightLimit), `chunk overweight: ${weight}`);
      return weight;
    })
  );

  console.log(`chunk weight ${weights[0].toHuman()}`);

  console.log("sending txs");

  for (let i = 0; i < chunks.length; i++) {
    console.log(`batch ${i}`);

    const response: any = await sendAndWaitFinalization({
      from: sendFrom,
      tx: chunks[i],
      //printEvents: ["utility", "sudo", "vesting"]
    }).catch(e => {
      console.log(e);
      process.exit(1);
    });
  }

  console.log("batchClaim complete");

  process.exit(0);
}

main()
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
