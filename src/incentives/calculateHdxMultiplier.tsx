/**
 * This library has the same top level api as d3Scale
 */
import BigNumber from 'bignumber.js';
import linearScale from 'simple-linear-scale'
import config from '../config'
import log from 'loglevel';

const incentivesConfig = config.incentives;

/**
 * Linear scale used to determine the reward multiplier
 * resulting from a range of possible lead percentage diffs.
 */
const hdxBonusScale = linearScale(
    [
        incentivesConfig.hdx.scale.leadPercentageDiff.min,
        incentivesConfig.hdx.scale.leadPercentageDiff.max
    ],
    [
        incentivesConfig.hdx.scale.rewardMultiplier.min,
        incentivesConfig.hdx.scale.rewardMultiplier.max
    ]
)

/**
 * 
 * @param siblingParachainValuation 
 * @param ownParachainValuation 
 * @param isAuctionClosing 
 */
export const calculateHdxMultiplier = (
    siblingParachainValuation: BigNumber, 
    ownParachainValuation: BigNumber, 
    isAuctionClosing: boolean
) => {
    // TODO: Should this be applied or not?
    /**
     * If the auction is not in the closing phase,
     * return the maximum reward multiplier
     */
    // if (!isAuctionClosing) {
    //     return incentivesConfig.hdx.scale.rewardMultiplier.min;
    // }
    
    /**
     * If our own auction has raised less money than the sibling auction,
     * then return the maximal reward multiplier
     * 
     * NOTE: it's called `min` within the scale config,
     */
    if (ownParachainValuation.isLessThanOrEqualTo(siblingParachainValuation)) {
        return incentivesConfig.hdx.scale.rewardMultiplier.min;
    }

    /**
     * Calculate the % diff for which our own auction is winning,
     * relative to the amount raised by our own auction.
     *  
     * Assuming that ownFundsRaised > siblingFundRaised
     * 
     * This calculation can be verified here:
     * https://www.wolframalpha.com/input/?i=percent+difference&assumption=%7B%22F%22%2C+%22PercentDifference%22%2C+%22number2%22%7D+-%3E%2241216215268999930%22&assumption=%7B%22F%22%2C+%22PercentDifference%22%2C+%22number1%22%7D+-%3E%22137017971757623070%22
     */
    const leadPercentageDiff = siblingParachainValuation
            .minus(ownParachainValuation)
            .dividedBy(ownParachainValuation)
            .multipliedBy(-1)
        

    log.debug('calculateHdxMultiplier', 'leadPercentageDiff',
        ownParachainValuation.toFixed(0),
        siblingParachainValuation.toFixed(0),
        leadPercentageDiff.toFixed(config.incentives.precision)
    );

    /**
     * If our auction is leading by more than `x` percent, return the minimal reward multiplier.
     */    
    const hdxBonus = leadPercentageDiff.isGreaterThanOrEqualTo(incentivesConfig.hdx.scale.leadPercentageDiff.max)
        ? incentivesConfig.hdx.scale.rewardMultiplier.max
        /**
         * Unless any of the specific reward multiplier calculation conditions were met,
         * calculate the appropriate HDX reward multiplier depending on the % lead of our own auction.
         */
        : hdxBonusScale(leadPercentageDiff)
    
    log.debug('calculateHdxMultiplier', 'hdxBonus', hdxBonus);

    return hdxBonus;
};
