/**
 * This library has the same top level api as d3Scale
 */
import BigNumber from 'bignumber.js';
import linearScale from 'simple-linear-scale'
import config from '../config'

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
 * @param siblingAuctionRaised 
 * @param ownAuctionRaised 
 * @param isAuctionClosing 
 */
export const calculateHdxMultiplier = (
    siblingParachainValidation: BigNumber, 
    ownParachainValidation: BigNumber, 
    isAuctionClosing: boolean
) => {
    /**
     * If the auction is not in the closing phase,
     * return the maximum reward multiplier
     */
    if (!isAuctionClosing) {
        return incentivesConfig.hdx.scale.rewardMultiplier.min;
    }
    
    /**
     * If our own auction has raised less money than the sibling auction,
     * then return the maximal reward multiplier
     * 
     * NOTE: it's called `min` within the scale config,
     */
    if (ownParachainValidation.isLessThanOrEqualTo(siblingParachainValidation)) {
        return incentivesConfig.hdx.scale.rewardMultiplier.min;
    }

    /**
     * Calculate the % diff for which our own auction is winning,
     * relative to the amount raised by our own auction.
     *  
     * Assuming that ownFundsRaised > siblingFundRaised
     */
    const leadPercentageDiff = siblingParachainValidation
        .minus(ownParachainValidation)
        .dividedBy(ownParachainValidation)
        .multipliedBy(-1)

    /**
     * If our auction is leading by more than `x` percent, return the minimal reward multiplier.
     */    
    if (leadPercentageDiff.isGreaterThanOrEqualTo(incentivesConfig.hdx.scale.leadPercentageDiff.max)) {
        return incentivesConfig.hdx.scale.rewardMultiplier.max
    }

    /**
     * Unless any of the specific reward multiplier calculation conditions were met,
     * calculate the appropriate HDX reward multiplier depending on the % lead of our own auction.
     */
    return hdxBonusScale(leadPercentageDiff)
};
