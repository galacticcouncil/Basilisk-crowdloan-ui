require("dotenv").config()
const BN = require("bn.js")
const { ApiPromise, WsProvider, Keyring } = require("@polkadot/api")
const { encodeAddress, cryptoWaitReady } = require("@polkadot/util-crypto")
const types = require("./types.js")
const { stringToU8a } = require("@polkadot/util")

const vestings = require("./data/vestings.json")

const ACCOUNT_SECRET = process.env.ACCOUNT_SECRET || "//Alice"
const RPC = process.env.RPC_SERVER || "ws://127.0.0.1:9988"

const amountToBN = (amount) => new BN(hdx).mul(new BN(10).pow(new BN(12)))
const bsxAddress = (pubKey) => encodeAddress(pubKey, 10041) // https://wiki.polkadot.network/docs/build-ss58-registry

async function main() {
  await cryptoWaitReady()
  const provider = new WsProvider(RPC)
  const keyring = new Keyring({ type: "sr25519" })
  const api = await ApiPromise.create({
    provider: provider,
    // types: types,
    // typesAlias: {
    //   tokens: {
    //     AccountData: "OrmlAccountData",
    //   },
    // },
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
  console.log("treasury account:", TREASURY)

  console.log("treasury vestedTransfer:", JSON.stringify(api, null, 4))

  process.exit()

  const vestingSchedules = [
    vestings.map(({destination, schedule}) =>
      api.tx.vesting.vestedTransfer(destination, schedule)
    )
  ]

  console.log("vestingSchedules generated:", vestingSchedules.length)

  

  // const batch = api.tx.utility.batch(vestingSchedules)
  // const sudo = api.tx.sudo.sudo(batch)

  // if (process.argv[2] === "test") {
  //   console.log('run "npm start" to send tx')
  //   process.exit()
  // }

  // console.log("sending tx")
  // await sudo.signAndSend(from, ({ events = [], status }) => {
  //   if (status.isInBlock) {
  //     console.log("included in block")
  //     console.log(
  //       "vestingSchedules executed:",
  //       events.filter(({ event: { method } }) => method === "Transfer").length
  //     )
  //   } else {
  //     console.log("tx: " + status.type)
  //   }
  //   if (status.type === "Finalized") {
  //     process.exit()
  //   }
  //   events
  //     .filter(({ event: { section } }) =>
  //       ["system", "utility", "sudo"].includes(section)
  //     )
  //     .forEach(({ event: { data, method, section } }) =>
  //       console.log(`event: ${section}.${method} ${data.toString()}`)
  //     )
  // })
}

main().catch((e) => {
  console.error(e)
  process.exit()
})