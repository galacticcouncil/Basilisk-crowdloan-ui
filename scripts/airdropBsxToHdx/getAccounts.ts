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
const BN = require("bignumber.js")

interface AirdropBsxToHdxVestingData {
    totalAllOgBalances: string
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
    
    let totalAllOgBalances = new BN('0')
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
                const address = hdxAddress(acct[0].slice(-32))
                // ^^^ * see explanation below
                if ( 
                    address === treasuryHdxAcct
                    || address === foundersInvestorsHdxAcct
                ) {
                    console.log('no airdrop for: ', address)
                    return acctsWeWant // we return the accounts we want _without_ adding treasury or founders/investors
                } else {
                    const balanceTotal = new BN(acct[1].data.free.toString()) 
                                                .plus( new BN(acct[1].data.reserved.toString()))
                    
                    totalAllOgBalances = totalAllOgBalances.plus( new BN( balanceTotal ) )
                    
                    acctsWeWant.push({
                        address,
                        balanceTotal,
                            // ^^^ Note:  free balance includes frozen balance
                            // https://wiki.polkadot.network/docs/learn-accounts#balance-types
                    })
                    return acctsWeWant
                }
            }, [] ) )


    const airdropBsxToHdxVestingData: AirdropBsxToHdxVestingData = {
        totalAllOgBalances,
        OgAccounts: ogHdxAccts
    }  
    
    const fs = require('fs');
    fs.writeFile(
        "./data/ogHdxHodlers.json", 
        JSON.stringify(airdropBsxToHdxVestingData, null, 4), 
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

/**
 * I found that `account.slice(-32)` thing here: https://stackoverflow.com/a/66228892

    And because that looks hacky ,  I spent some time trying to understand and use different utility methods,  but gave up after a while

    as the code stands now,  if I don't do the `.slice(-32)`,  It throws:  

    ```
    Error: Expected a valid key to convert, with length 1, 2, 4, 8, 32, 33
        at assert (/Users/timothymitchell/dev/gc/repos/Basilisk-crowdloan-ui/node_modules/@polkadot/util/assert.cjs:36:11)
        at encodeAddress (/Users/timothymitchell/dev/gc/repos/Basilisk-crowdloan-ui/node_modules/@polkadot/util-crypto/address/encode.cjs:26:20)
        at hdxAddress (/Users/timothymitchell/dev/gc/repos/Basilisk-crowdloan-ui/scripts/airdropBsxToHdx/getAccounts.ts:94:40)
        at /Users/timothymitchell/dev/gc/repos/Basilisk-crowdloan-ui/scripts/airdropBsxToHdx/getAccounts.ts:54:37
        at Array.reduce (<anonymous>)
        at /Users/timothymitchell/dev/gc/repos/Basilisk-crowdloan-ui/scripts/airdropBsxToHdx/getAccounts.ts:52:49
        at processTicksAndRejections (node:internal/process/task_queues:96:5)
    ```
 */