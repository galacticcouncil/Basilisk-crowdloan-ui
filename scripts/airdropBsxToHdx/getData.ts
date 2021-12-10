// ✅ connect to HDX archive rpc
// ✅ -> get HDX holders at block #1999999 of HDX chain
// ✅ -> api.query.system.accounts.entries.at()
// ✅ -> discard treasury and intergalactic acc
    // 0x6d6f646c70792f74727372790000000000000000000000000000000000000000 (HDX Treasury)
    // 0x0abad795adcb5dee45d29528005b1f78d55fc170844babde88df84016c6cd14d (Founders & Investors)
// ✅ for an individual account sum free and reserved balance 💪
// ✅ total all balances for use in calculating airdrop according to weight

// ✅ create an 'accounts' .json ?  probably.. like 'contribs' for documentation purposes :| :)


const { ApiPromise, WsProvider, Keyring } = require("@polkadot/api")
const { deriveAddress, encodeAddress, cryptoWaitReady } = require("@polkadot/util-crypto")
const { stringToU8a } = require("@polkadot/util")
const BN = require("BN.js")

interface AirdropBsxToHdxData {
    totalAllOgHdxBalances: string
    OgAccounts: OgAccount[]
}

interface OgAccount {
    address: string
    freeBalance: string
}

const hdxTreasuryPubKey = '0x6d6f646c70792f74727372790000000000000000000000000000000000000000'
const foundersInvestorsPubKey = '0x0abad795adcb5dee45d29528005b1f78d55fc170844babde88df84016c6cd14d'

async function main() {
    await cryptoWaitReady()
    const hdxArchiveNode = 'wss://archive.snakenet.hydradx.io'
    const provider = new WsProvider(hdxArchiveNode)
    const api = await ApiPromise.create({provider});

    // Get general information about the node we are connected to
    const [chain, nodeName, nodeVersion] = await Promise.all([
        api.rpc.system.chain(),
        api.rpc.system.name(),
        api.rpc.system.version()
    ]);
    console.log(
        `
        \n You are connected to ${chain}
        \n via ${hdxArchiveNode}
        \n using ${nodeName} v${nodeVersion} \n
        `
    )

    let totalAllOgHdxBalances = new BN('0')
    const blockHeight = '1999999'
    //   ^^^  block height at which to get orignial HDX accounts
    //   link or explanation for this blockheight ?
    const treasuryHdxAcct = hdxAddress(hdxTreasuryPubKey)
    const foundersInvestorsHdxAcct = hdxAddress(foundersInvestorsPubKey)
    const ogHdxAccts: OgAccount[] = await api.rpc.chain.getBlockHash(blockHeight)
            .then( blockHash => api.rpc.chain.getBlock(blockHash) )
            .then( signedBlock => signedBlock.block.header.hash.toHex() )
            .then( blockHex => api.query.system.account.entriesAt(blockHex) )
            .then( accountsData => accountsData.reduce(( acctsWeWant, [key, {data}] ) => {
                const [address] = key.toHuman()
                if (
                    address === treasuryHdxAcct
                    || address === foundersInvestorsHdxAcct
                ) {
                    console.log('no airdrop for: ', address)
                    return acctsWeWant // we return the accounts we want _without_ adding treasury or founders/investors
                } else {
                    const hdxBalanceTotal = new BN(data.free.toString())
                                            .add( new BN(data.reserved.toString())).toString()
                                            // ^^^ Note:  free balance includes frozen balance
                                            // https://wiki.polkadot.network/docs/learn-accounts#balance-types

                    totalAllOgHdxBalances = totalAllOgHdxBalances.add( new BN( hdxBalanceTotal ) )

                    acctsWeWant.push({
                        address,
                        hdxBalanceTotal,
                    })
                    return acctsWeWant
                }
            }, [] ) )


    const airdropBsxToHdxData: AirdropBsxToHdxData = {
        totalAllOgHdxBalances: totalAllOgHdxBalances.toString(),
        OgAccounts: ogHdxAccts
    }

    const fs = require('fs');
    fs.writeFile(
        "./data/airdropData.json",
        JSON.stringify(airdropBsxToHdxData, null, 4),
        { flag: 'wx' },
        function(err: any) {
            if (err) {
                console.error(err)
                process.exit(1)
            }
            console.log('complete')
            process.exit(0);
        }
    )
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})

function hdxAddress( pubKey ) { return encodeAddress(pubKey, 63) }

