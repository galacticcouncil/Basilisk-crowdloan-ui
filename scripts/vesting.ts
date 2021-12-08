import BigNumber from "bignumber.js"
import data from './data/rewards.json'
import {Report} from './reward'


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

const leaseStartBlock = new BigNumber('9334719')
    // our auction ended on this block ^^^ _9 334 719_ https://kusama.subscan.io/auction/8

const vestScheduleEndBlock = new BigNumber('13834719')
    //  ^^^ this is a block that will occur ~week before our lease ends, 
    //  it gives us nice numbers,  and ensures a good buffer for all vests to happen

const vestDurationInBlocks = 
    vestScheduleEndBlock
    .minus(leaseStartBlock)
    
    let vestings: DynamicVestingInfo[] = (data as Report).rewards.flatMap(reward => {
    const thirtyPercent = 
        new BigNumber(reward.totalBsxReward)
        .multipliedBy(new BigNumber(0.3))
        .toFixed(0)

    const seventyPercent = 
        new BigNumber(reward.totalBsxReward)
        .multipliedBy(new BigNumber(0.7))

    const messyPerBlockBsx = 
        new BigNumber(seventyPercent)
        .dividedBy(vestDurationInBlocks)
        /// ^^^ messy cuz decimals =(

    const sumAllDecimalAmounts = 
        new BigNumber(messyPerBlockBsx.modulo(1))
        .multipliedBy(vestDurationInBlocks)
        .decimalPlaces(0, BigNumber.ROUND_UP)
        // all decimal amounts are in this sum and we can easily pay it out =D
    
    const thirtyPercentPlusAllDecimalAmounts = 
        sumAllDecimalAmounts
        .plus(thirtyPercent)
        .toString()

    const seventyPercentMinusAllDecimalAmounts = 
        seventyPercent.decimalPlaces(0, 1).minus(sumAllDecimalAmounts).toFixed(0)

    const tidyPerBlockBsx = 
        messyPerBlockBsx.decimalPlaces(0, 1)
        /// ^^^ tidy cuz no decimals =)

    return  [
        {
            destination: reward.address,
            schedule: {
                amountToBeVested: thirtyPercentPlusAllDecimalAmounts,
                start: leaseStartBlock.toString(),
                period: '1',
                per_period: thirtyPercentPlusAllDecimalAmounts,
                period_count: '1'
            }
            
        },
        {
            destination: reward.address,
            schedule: {
                amountToBeVested: seventyPercentMinusAllDecimalAmounts,
                start: leaseStartBlock.toString(),
                period: '1',
                per_period: tidyPerBlockBsx.toString(),
                period_count: vestDurationInBlocks.toString()
            }
        }
    ]
})

const vestingBatch: VestingBatch = vestings

const fs = require('fs')
fs.writeFile ("data/vestings.json", JSON.stringify(vestingBatch, null, 4), function(err) {
        if (err) throw err
        console.log('complete')
    }
)