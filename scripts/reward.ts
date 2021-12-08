import BigNumber from "bignumber.js";
import * as data from './data/contribs.json'

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
    incentives: {
        bsx: {
            allocated: new BigNumber(toKsmPrecision(new BigNumber('15000000000'))),
            scale: {
                max: 1,
                min: 0,
                none: 0
            }
        }
    }
};

type Contribution = {
    account: {accountId: string},
    blockHeight: string,
    balance: string,
    ksmPrice: string,
    createdAt: string,
};

const fixedKsmPrice = '400'
const ksmPrecision = 12;
const ksmPrecisionMultiplierBN = new BigNumber('10').pow('12');

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



const getBsxMultiplier = () => {
    return config.incentives.bsx.scale.max;
}

const calculateContributionsWeight = (
    contributions: Contribution[],
) => {
    return contributions
        .reduce((weight, contribution) => {
            const bsxMultiplier = getBsxMultiplier();
            weight = weight.plus(
                new BigNumber(contribution.balance)
                    .multipliedBy(bsxMultiplier)
            );

            return weight;
        }, new BigNumber(0));
}

const getHdxBonus = (blockHeight: Number) => {
    if (blockHeight > 9233727) {
        return 5;
    }else{
        return 30
    }
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
        
        let inReward  = usdToHdx(ksmToUsd(contributionHdxReceivedInKsm, fixedKsmPrice)); 

        hdxReceivedInKsm = hdxReceivedInKsm
                .plus(inReward);

        return hdxReceivedInKsm;
    }, new BigNumber('0'));
}

export const calculateCurrentBsxReceived = (
    contributions: Contribution[] = [],
    totalContributionWeight: string,
) => {
    const accountContributionsWeight = calculateContributionsWeight(
        contributions,
    );
    const totalContributionWeightBN = new BigNumber(totalContributionWeight);

    if (totalContributionWeightBN.isZero()) return new BigNumber(0);

    return config.incentives.bsx.allocated
        .dividedBy(totalContributionWeightBN)
        .multipliedBy(accountContributionsWeight);
}


export type Reward = {
    address: string,
    totalBsxReward: string,
    totalHdxReward: string,
    totalContribution: string,
    totalContributionWeight: string,
    contributions: OutputContribution[],
};

export type OutputContribution = {
    blockHeight: string,
    balance: string,
    hdxBonus: string,
    ksmPrice: string,
    multiplier: string,
    createdAt: string,
};

export type Report = {
    stats: {
        totalKsmRaised: string,
        totalBsxRewarded: string,
        totalHdxRewarded: string,
        totalContributionWeight: string,
        bsxAllocated: string,
        remaining: string,
    },
    rewards: Reward[]
}

let total_bsx = new BigNumber(0)
let total_hdx  = new BigNumber(0)
let tw = new BigNumber(0)

let records: Reward[] = [];
(data as []).forEach(function (x) {
  let c: Contribution[] = x;
  const total_contribution = c.reduce((total_contribution, contribution) => {
      total_contribution = total_contribution.plus(new BigNumber(contribution.balance));
      return total_contribution;
  }, new BigNumber('0'));
  let weight = calculateContributionsWeight(c);
  let bsx_reward = calculateCurrentBsxReceived(c, config.totalContributionWeight);
  let hdx_reward = calculateCurrentHdxReceived(c);

  tw = tw.plus(weight);
  total_bsx = total_bsx.plus(bsx_reward)
  total_hdx = total_hdx.plus(hdx_reward)

    let contributions = c.map( (c) => {
        return {
            balance: c.balance,
            blockHeight: c.blockHeight,
            hdxBonus: getHdxBonus(parseInt(c.blockHeight)).toString(),
            ksmPrice: fixedKsmPrice,
            multiplier: getBsxMultiplier().toString(),
            createdAt: c.createdAt,
        }
    })

    let record: Reward  = {address: c[0].account.accountId,
        totalBsxReward: bsx_reward.toFixed(0),
        totalHdxReward: hdx_reward.toFixed(0),
        totalContribution: total_contribution.toString(),
        totalContributionWeight: weight.toString(),
        contributions: contributions,
        };

    records.push(record);
})

let remaining = config.incentives.bsx.allocated.minus(total_bsx)

let report: Report = {
    stats: {
        totalKsmRaised: tw.dividedBy(ksmPrecisionMultiplierBN).toString(),
        totalBsxRewarded: total_bsx.toFixed(0),
        totalHdxRewarded: total_hdx.toFixed(0),
        totalContributionWeight: tw.toString(),
        bsxAllocated: config.incentives.bsx.allocated.toFixed(0),
        remaining: remaining.toFixed(0)
    },
    rewards: records
}

const fs=require('fs');

fs.writeFile("data/rewards.json", JSON.stringify(report, null, 4), function(err) {
    if (err) throw err;
    console.log('complete');
    }
);