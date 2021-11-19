import BigNumber from "bignumber.js";
import * as data from './data/contribs.json'
import * as ksmPrices from './data/coingecko-hourly-prices.json'

const toKsmPrecision = (humanAmount: any) => {
    return new BigNumber(humanAmount)
            .multipliedBy(
                new BigNumber(10)
                    .exponentiatedBy(12)
            )
            .toFixed(ksmPrecision)
}

const config = {
    opportunityCost: new BigNumber('0.1375'),
    hdxToUsd: '0.08059',
    totalContributionWeight: '222221915331441360',
};

type Contribution = {
    account: {accountId: string},
    blockHeight: string,
    balance: string,
    ksmPrice: string,
    createdAt: string,
};

const ksmPrecision = 12;

const ksmToUsd = (amount: any, price: any) => {
    return new BigNumber(amount)
        .multipliedBy(price)
        .toFixed(ksmPrecision)
}

const usdToHdx = (amount: any) => {
    return new BigNumber(amount)
        .dividedBy(config.hdxToUsd)
        .toFixed(ksmPrecision)
}

const getHdxBonus = (blockHeight: Number) => {
    if (blockHeight > 9233727) {
        return 5;
    }else{
        return 30
    }
}


const getClosestKsmPrice_Before_Contribution = (contributionCreatedAt: string) => {
    const contributionUnixTimestamp = new Date(contributionCreatedAt).getTime()
    const closestKsmPrice = ksmPrices.data.find((theOne, index, array) => {
        const priceThisHour = theOne[0]
        const priceNextHour = array[index + 1][0]
        return (priceThisHour <= contributionUnixTimestamp) && (priceNextHour >= contributionUnixTimestamp)
    })[1]
    return closestKsmPrice
}

const calculateCurrentHdxReceived = (
    contributions: Contribution[]
) => {
    return contributions.reduce((hdxReceivedInKsm, contribution) => {
        const hdxBonus = getHdxBonus(parseInt(contribution.blockHeight));

        const contributionHdxReceivedInKsm = new BigNumber(contribution.balance)
            .multipliedBy(
                new BigNumber(config.opportunityCost)
            )
            .multipliedBy(
                new BigNumber(hdxBonus)
            )
            // divide by 100 since hdx bonus is '30' not '0.3'
            .dividedBy(
                new BigNumber(100)
            )
        
        let inReward  = usdToHdx(ksmToUsd(contributionHdxReceivedInKsm, getClosestKsmPrice_Before_Contribution(contribution.createdAt))); // <-- function here to find closest price to before contribution

        hdxReceivedInKsm = hdxReceivedInKsm
                .plus(inReward);

        return hdxReceivedInKsm;
    }, new BigNumber('0'));
}

type Reward = {
    address: string,
    totalHdxReward: string,
    totalContribution: string,
    contributions: OutputContribution[],
};

type OutputContribution = {
    blockHeight: string,
    balance: string,
    hdxBonus: string,
    ksmPrice: string,
    createdAt: string,
};

type Report = {
    stats: {
        totalHdxRewarded: string,
    },
    rewards: Reward[]
}

let total_hdx  = new BigNumber(0)
let tw = new BigNumber(0)

let records: Reward[] = [];
data.forEach(function (x) {
  let c: Contribution[] = x;
  const total_contribution = c.reduce((total_contribution, contribution) => {
      total_contribution = total_contribution.plus(new BigNumber(contribution.balance));
      return total_contribution;
  }, new BigNumber('0'));

  let hdx_reward = calculateCurrentHdxReceived(c);

  total_hdx = total_hdx.plus(hdx_reward)

    let contributions = c.map( (c) => {
        let ksm_price = getClosestKsmPrice_Before_Contribution(c.createdAt)
        return {
            balance: c.balance,
            blockHeight: c.blockHeight,
            hdxBonus: getHdxBonus(parseInt(c.blockHeight)).toString(),
            ksmPrice: String(ksm_price),
            createdAt: c.createdAt,
        }
    })

  let record: Reward  = {address: c[0].account.accountId,
    totalHdxReward: hdx_reward.toFixed(0),
    totalContribution: total_contribution.toString(),
    contributions: contributions,
    };

  records.push(record);
})

let report: Report = {
    stats: {
        totalHdxRewarded: total_hdx.toFixed(0),
    },
    rewards: records
}

const fs =require('fs');
fs.writeFile ("closest-before-contribution-ksm-price--approach-rewards.json", JSON.stringify(report, null, 4), function(err) {
    if (err) throw err;
    console.log('complete');
    }
);