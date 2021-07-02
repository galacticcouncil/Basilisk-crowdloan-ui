import linearScale from 'simple-linear-scale'
import config from '../config'

const incentivesConfig = config.incentives;

export const calculateBsxMultiplier = (
    curBlockNum: number, 
    curAuctionId: null | number,
    curAuctionClosingStart: null | number,
    curAuctionClosingEnd: null | number,
) => {
    // if we're in targetAuctionId - 1, return full bsx multiplier
    if ((curAuctionId || 0) < config.targetAuctionId) return incentivesConfig.bsx.scale.rewardMultiplier.min;
    // There is no curAuctionId, therefore no closing start/end information either.
    // Which means there is no auction registred yet therefore we return the full multiplier.
    if (!curAuctionClosingStart || !curAuctionClosingEnd) return incentivesConfig.bsx.scale.rewardMultiplier.min;
    
    /**
     * Linear scale used to determine the reward multiplier
     * resulting from a range of possible lead percentage diffs.
     */
    const bsxMultiplierScale = linearScale(
        [
            curAuctionClosingStart,
            curAuctionClosingEnd
        ],
        [
            incentivesConfig.bsx.scale.rewardMultiplier.min,
            incentivesConfig.bsx.scale.rewardMultiplier.max
        ]
    )
    
    const isAuctionClosing = curBlockNum >= curAuctionClosingStart;
    // if the auction is not closing, return the full bsx multiplier
    if (!isAuctionClosing) return incentivesConfig.bsx.scale.rewardMultiplier.min
    
    /**
     * If the auction is closing, calculate the multipler on a scale
     * from curAuctionClosingStart to curAuctionClosingEnd
     * using the curBlockNum
     */
    return bsxMultiplierScale(curBlockNum)
}