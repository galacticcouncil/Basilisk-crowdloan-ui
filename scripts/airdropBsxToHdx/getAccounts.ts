// ✅ connect to HDX archive rpc
// ✅ -> get HDX holders at block #1999999 of HDX chain
// ✅ -> api.query.system.accounts.entries.at()
// ✅ -> discard treasury and intergalactic acc
    // 0x6d6f646c70792f74727372790000000000000000000000000000000000000000 (HDX Treasury)
    // 0x0abad795adcb5dee45d29528005b1f78d55fc170844babde88df84016c6cd14d (Founders & Investors)

// ✅ create an 'accounts' .json ?  probably.. like 'contribs' for documentation purposes :| :) 

const { ApiPromise, WsProvider, Keyring } = require("@polkadot/api")
const { deriveAddress, encodeAddress, cryptoWaitReady } = require("@polkadot/util-crypto")
const { stringToU8a } = require("@polkadot/util")

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
    
    const blockHeight = '1999999'
    //   ^^^  block height at which to get orignial HDX accounts
    //   link or explanation for this blockheight ?
    const treasuryHdxAcct = hdxAddress(hdxTreasuryPubKey)
    const foundersInvestorsHdxAcct = hdxAddress(foundersInvestorsPubKey)
    const ogHdxAccts: OgAccount[] = await api.rpc.chain.getBlockHash(blockHeight) 
            .then( blockHash => api.rpc.chain.getBlock(blockHash) )
            .then( signedBlock => signedBlock.block.header.hash.toHex() )
            .then( blockHex => api.query.system.account.entriesAt(blockHex) )
            .then( accountsData => accountsData.reduce(( acctsWeWant, acct ) => {
                const acctAddress = hdxAddress(acct[0].slice(-32))
                if ( 
                    acctAddress === treasuryHdxAcct
                    || acctAddress === foundersInvestorsHdxAcct
                ) {
                    console.log('no airdrop for: ', acctAddress)
                    return acctsWeWant // we return the accounts we want _without_ adding treasury or founders/investors
                } else {
                    acctsWeWant.push({
                        address: acctAddress,
                        freeBalance: acct[1].data.free.toString(),
                        // reservedBalance: acct[1].data.reserved.toString()
                        // question:  reserved balance doesn't matter,  right ?
                    })
                    return acctsWeWant
                }
            }, [] ) )

    const fs = require('fs');
    fs.writeFile(
        "./data/ogHdxHodlers.json", 
        JSON.stringify(ogHdxAccts, null, 4), 
        { flag: 'wx' }, 
        function(err: any) {
            if (err) {
                console.error(err)
                process.exit(1) 
            }
            console.log('complete')
        }
    )
}
  
main().catch((e) => {
    console.error(e)
    process.exit()
})

function hdxAddress( pubKey ) { return encodeAddress(pubKey, 63) }

