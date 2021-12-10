// ✅  -> calculate BSX reward for accounts from .json of getData

// ✅ -> calulate 5 000 000 000 proportional to holdings at the time for each holder
//  ->  output a .json schedule

// ✅  -> use same schedule as we used for 70% of each contributor's BSX crowdloan rewards

const BN = require("BN.js")
const airdropData = require("./data/airdropData.json")

type DynamicVestingInfo = {
    destination: string,
    schedule: {
        amountToBeVested: string,
        start: string,
        period: string,
        per_period: string,
        period_count: string 
    }
}

type VestingBatch = DynamicVestingInfo[]

const airdropBsxAllocation = new BN('5000000000000000000000')
// https://basiliskfi.substack.com/p/introducing-basilisk 
// ^^^ 25% of HDX holders ( HDX LBP participants, team and investors ) allocation
const sumHdxBalances = new BN(airdropData.totalAllOgHdxBalances) 
const bsxAirdroppedPerOneHdx = 
    airdropBsxAllocation
    .div(sumHdxBalances)
    .toString()

console.log('\n amount of BSX tokens you get per one HDX token: ', bsxAirdroppedPerOneHdx + '\n') // --> 10

const leaseStartBlock = new BN('9334719').toString()
    // our auction ended on this block 
    // ^^^ _9 334 719_ https://kusama.subscan.io/auction/8

const vestScheduleEndBlock = new BN('13834719')
//  ^^^ this is a block that will occur ~week before our lease ends, 
//  and ensures a good buffer for all vests to happen

const vestDurationInBlocks = 
    vestScheduleEndBlock
    .sub( new BN( leaseStartBlock )).toString()

const vestingBatch: VestingBatch = 
    airdropData.OgAccounts
        .filter( acct =>  new BN(acct.hdxBalanceTotal).gt(new BN('0')))
            // filter for and use accounts that have any HDX
        .map( acct => {

        const amountToBeVested = new BN(acct.hdxBalanceTotal)
            .mul(new BN(bsxAirdroppedPerOneHdx))
            .toString()

        const perBlockBsx = 
            new BN(amountToBeVested)
            .div( new BN( vestDurationInBlocks )).toString()
        
        const destination = acct.address

        return {
                destination,
                schedule: {
                    amountToBeVested,
                    start: leaseStartBlock,
                    period: '1',
                    per_period: perBlockBsx,
                    period_count: vestDurationInBlocks
                }
            }
        
    } )

const fs = require('fs')
fs.writeFile (
    "./data/vestings.json",
    JSON.stringify(vestingBatch, null, 4),
    { flag: 'wx' },
    function(err) {
        if (err) throw err
        console.log('complete')
    }
)