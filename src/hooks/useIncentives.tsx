import BigNumber from "bignumber.js"
import { chown } from "fs"
import { useChronicle, useOwn, useSibling } from "src/containers/store/Store"
import { calculateBsxMultiplier } from '../incentives/calculateBsxMultiplier'
import { calculateHdxMultiplier } from '../incentives/calculateHdxMultiplier' 

export const useIncentives = () => {
    let chronicle = useChronicle();
    let own = useOwn();
    let sibling = useSibling();

    if (!own.data.crowdloan || !sibling.data.crowdloan) return {
        hdxBonus: null,
        bsxMultiplier: null
    };
    
    let bsxMultiplier = calculateBsxMultiplier(
        chronicle.data.curBlockNum,
        chronicle.data.curAuctionId,
        chronicle.data.curAuction?.closingStart,
        chronicle.data.curAuction?.closingEnd
    );

    const curAuctionClosingStart = chronicle.data.curAuction.closingStart;
    const isAuctionClosing = curAuctionClosingStart 
        ? (chronicle.data.curBlockNum >= curAuctionClosingStart)
        : false

    let hdxBonus = calculateHdxMultiplier(
        new BigNumber(sibling.data.crowdloan.raised),
        new BigNumber(own.data.crowdloan.raised),
        isAuctionClosing,
    );

    console.log(own, sibling);

    return {
        hdxBonus: new BigNumber(hdxBonus),
        bsxMultiplier: new BigNumber(bsxMultiplier)
    }
}
