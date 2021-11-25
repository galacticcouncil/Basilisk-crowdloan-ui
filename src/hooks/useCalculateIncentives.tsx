import BigNumber from "bignumber.js";
import { LoadingState, useAccount, useChronicle, useChronicleLastProcessedBlock, useIncentives, useOwnHasWonAnAuction, useOwn } from "src/containers/store/Store"
import linearScale from 'simple-linear-scale';
import config, { precisionMultiplierBN } from "src/config";
import { Contribution, HistoricalIncentive } from "./useQueries";
import { fromKsmPrecision } from "src/utils";
import { find } from "lodash";

export const calculateHdxBonus = (
    leadPercentageRate: string,
) => {    
    const leadPercentageRateBN = new BigNumber(leadPercentageRate);
    const cliffStart = config.incentives.hdx.leadPercentageRateCliffRange[0];
    const cliffEnd = config.incentives.hdx.leadPercentageRateCliffRange[1]
    
    // following if statements are necessary due to linearScale clamping being broken
    // if the lead diff is smaller than the cliff start, return maximum bonus
    if (leadPercentageRateBN.lt(cliffStart)) return config.incentives.hdx.scale.max; 
    // if the lead diff is larger than the cliff end, return minimum bonus
    if (leadPercentageRateBN.gt(cliffEnd)) return config.incentives.hdx.scale.min;

    const hdxBonusScale = linearScale(
        [
            cliffStart,
            cliffEnd
        ], 
        [
            config.incentives.hdx.scale.max,
            config.incentives.hdx.scale.min
        ]
    )
    
    return hdxBonusScale(leadPercentageRate);
}

export const calculateBsxMultiplier = (
    blockHeight: string, 
    mostRecentAuctionClosingStart: string | undefined,
) => {
    return config.incentives.bsx.scale.max;
    // there is no recent auction, return the full bsx multiplier
    // if (!mostRecentAuctionClosingStart) return config.incentives.bsx.scale.max;

    // const mostRecentAuctionClosingEnd = new BigNumber(mostRecentAuctionClosingStart)
    //     .plus(config.auctionEndingPeriodLength)
    //     .toNumber();

    // const blockHeightBN = new BigNumber(blockHeight);

    // const bsxMultiplierScale = linearScale(
    //     // TODO: when we are about to win an auction, replace the following ranges
    //     // with real auction ranges instead and skip any other logic
    //     [
    //         parseInt(mostRecentAuctionClosingStart),
    //         mostRecentAuctionClosingEnd
    //     ],
    //     [
    //         config.incentives.bsx.scale.max,
    //         config.incentives.bsx.scale.min
    //     ]
    // )

    // // if the current blockHeight is out of bounds for the most recent auction, return the full bsx multiplier
    // // this also means the contribution was not for the winning auction since it was
    // // accepted after the auction ended
    // if (blockHeightBN.lt(mostRecentAuctionClosingStart) || blockHeightBN.gt(mostRecentAuctionClosingEnd)) {
    //     return config.incentives.bsx.scale.max;
    // }

    // return bsxMultiplierScale(blockHeight)
}

export const calculateContributionsWeight = (
    contributions: Contribution[], 
    mostRecentAuctionClosingStart: string | undefined,
) => {
    const accountContributionsWeight = contributions
        .reduce((weight, contribution) => {
            const bsxMultiplier = calculateBsxMultiplier(
                contribution.blockHeight,
                mostRecentAuctionClosingStart
            );

            weight = weight.plus(
                new BigNumber(contribution.balance)
                    .multipliedBy(bsxMultiplier)
            );

            return weight;
        }, new BigNumber(0));

    return accountContributionsWeight
}

export const calculateMinimumBsxReceived = (
    contributions: Contribution[] = [], 
    mostRecentAuctionClosingStart: string | undefined,
): BigNumber => {
    const accountContributionsWeight = calculateContributionsWeight(
        contributions,
        mostRecentAuctionClosingStart,
    );
    const minimumBsxReceived = config.incentives.bsx.allocated
        .dividedBy(
            config.crowdloanCap
                .multipliedBy(
                    config.incentives.bsx.scale.max
                )
        )
        .multipliedBy(accountContributionsWeight);

    return minimumBsxReceived;
}

export const calculateCurrentBsxReceived = (
    contributions: Contribution[] = [], 
    mostRecentAuctionClosingStart: string | undefined,
    totalContributionWeight: string,
) => {
    const accountContributionsWeight = calculateContributionsWeight(
        contributions, 
        mostRecentAuctionClosingStart,
    );
    const totalContributionWeightBN = new BigNumber(totalContributionWeight)    

    if (totalContributionWeightBN.isZero()) return new BigNumber(0);

    const currentBsxReceived = config.incentives.bsx.allocated
        .dividedBy(totalContributionWeightBN)
        .multipliedBy(accountContributionsWeight);

    return currentBsxReceived;
}

const getHdxBonus = (blockHeight: Number) => {
    if (blockHeight > 9233727) {
        return 5;
    }else{
        return 30
    }
}

export const calculateCurrentHdxReceived = (
    contributions: Contribution[], 
    historicalIncentives: HistoricalIncentive[],
) => {
    const hdxReceivedInKsm = contributions.reduce((hdxReceivedInKsm, contribution) => {
        const historicalIncentive = find(historicalIncentives, { 
            blockHeight: `${contribution.blockHeight}`
        });
        const leadPercentageRate = historicalIncentive?.leadPercentageRate || '0';

        // this will account for the contribution with the max hdxBonus
        // if the leadPercentage rate defaults to '0'
        // TODO: handle missing historical incentive differently?
        // NOTE: could use a medium hdxBonus in case the historical data is missing
        // this would be the most gracious way to handle the missing data.
        // It would confuse the users the least.
        // const hdxBonus = calculateHdxBonus(leadPercentageRate);
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

        hdxReceivedInKsm = hdxReceivedInKsm
                .plus(contributionHdxReceivedInKsm);
        
        return hdxReceivedInKsm;
    }, new BigNumber('0'));

    return hdxReceivedInKsm;
}

export const useCalculateCurrentAccountHdxReceived = () => {
    const { data: { contributions, historicalIncentives } } = useAccount();
    return calculateCurrentHdxReceived(
        contributions, 
        historicalIncentives
    );
}

export const useCalculateCurrentAccountMinimumBsxReceived = () => {
    const { data: { contributions } } = useAccount();
    const { data: { mostRecentAuctionClosingStart } } = useChronicle();

    return calculateMinimumBsxReceived(
        contributions, 
        mostRecentAuctionClosingStart
    );
}

export const useCalculateCurrentAccountCurrentBsxReceived = () => {
    const { data: { contributions } } = useAccount();
    const { data: { mostRecentAuctionClosingStart } } = useChronicle();
    const { parachain: { data: { fundsPledged: contributionWeightOfAllContributors } } } = useOwn();

    return calculateCurrentBsxReceived(
        contributions, 
        mostRecentAuctionClosingStart,
        String(contributionWeightOfAllContributors)
    );
}


/**
 * TODO: This function could be optimalized to recalculate only 
 * when the incentives really change. 
 */
export const useGlobalIncentives = () => {
    const incentives = useIncentives();
    const lastProcessedBlock = useChronicleLastProcessedBlock();
    const { data: { mostRecentAuctionClosingStart } } = useChronicle();

    if (incentives.loading !== LoadingState.Loaded) return {
        bsxMultiplier: undefined,
        hdxBonus: undefined
    }

    const hdxBonus = new BigNumber(
        calculateHdxBonus(incentives.data.leadPercentageRate)
    );

    const bsxMultiplier = new BigNumber(
        calculateBsxMultiplier(
            lastProcessedBlock, 
            mostRecentAuctionClosingStart
        )
    );

    return {
        bsxMultiplier,
        hdxBonus
    }
}
