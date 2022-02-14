// ✅  -> calculate BSX reward for accounts from .json of getData

// ✅ -> calulate 5 000 000 000 proportional to holdings at the time for each holder
//  ->  output a .json file of all schedules

// ✅  -> start vesting at 9 334 719, Crowd Loan BSX vest
// ✅  -> end vesting ~22 months after start

const bignumber = require("bignumber.js")
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

const MinVesting = new bignumber('100000')
const tenTo12Power = new bignumber('10').pow('12');

const airdropBsxAllocation = 
    new bignumber('100000000000') // 100b -> total supply of BSX
    .multipliedBy(new bignumber('0.05'))
    .multipliedBy(tenTo12Power).toFixed(0)
// ^^^ 5% of total supply

console.log(
    '\n total allocation to non-investor, non-founder accounts: ', 
    new bignumber(airdropBsxAllocation).div(tenTo12Power).toString() + '\n'
)

const sumHdxBalances = new bignumber(airdropData.totalAllOgHdxBalances)

const bsxAirdroppedPerOneHdx = 
    new bignumber(airdropBsxAllocation).div(sumHdxBalances)

console.log(
    '\n amount of BSX tokens you get per one HDX token: ', 
    bsxAirdroppedPerOneHdx.toString() + '\n'
)

const leaseStartBlock = '9334719'
    // the auction we won ended on this block 
    // ^^^ _9 334 719_ https://kusama.subscan.io/auction/8

const twentyTwoMonthsInBlocks = (
    60*    // seconds in minute
    60*    // minutes in an hour
    24*    // hours in a day
    30*    // days in a month
    22/    // months
    6      // seconds to produce a block -> https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fkusama-rpc.polkadot.io#/explorer
).toFixed(0)

console.log(
    '\n ~twentyTwoMonthsInBlocks: ', 
    twentyTwoMonthsInBlocks.toString() + '\n'
)

const vestingBatch: VestingBatch = 
    airdropData.OgAccounts
        .filter( acct =>  new bignumber(acct.hdxBalanceTotal).gt(new bignumber('0')))
            // filter for and use accounts that have any HDX
        .filter( acct =>  {
            new bignumber(acct.hdxBalanceTotal).lt(MinVesting))
            console.log(`no airdrop for ${acct.address}. The minimum vesting amount has not been reached.`)
            // filter accounts that have less than the minimum HDX
            }
        .map( acct => {

            const amountToBeVested = 
                new bignumber(acct.hdxBalanceTotal)
                .multipliedBy(bsxAirdroppedPerOneHdx)
                .toFixed(0)

            const perBlockBsx = 
                new bignumber(amountToBeVested)
                .div(new bignumber(twentyTwoMonthsInBlocks))
                .toFixed(0)
            
            const destination = acct.address

            return {
                    destination,
                    schedule: {
                        amountToBeVested: amountToBeVested,
                        start: leaseStartBlock,
                        period: '1',
                        per_period: perBlockBsx,
                        period_count: twentyTwoMonthsInBlocks.toString()
                    }
                }
            
        } )

console.log(
    '\n funds dispersed; sum total all amounts to be vested: ',
    new bignumber(
        vestingBatch.reduce(
            (acc, el) => 
                new bignumber(acc)
                .plus(new bignumber(el.schedule.amountToBeVested))
            , new bignumber('0'))
        )
        .div(tenTo12Power)
        .toString()
    ,
    '\n'
)

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