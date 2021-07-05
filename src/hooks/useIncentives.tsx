import BigNumber from "bignumber.js"
import { chown } from "fs"
import { useEffect, useState } from "react"
import { useAccount, useChronicle, useOwn, useSibling, useHistoricalIncentives, useStoreContext, ActionType, useContributions } from "src/containers/store/Store"
import { calculateBsxMultiplier } from '../incentives/calculateBsxMultiplier'
import { calculateHdxMultiplier } from '../incentives/calculateHdxMultiplier' 
import { useHistoricalSiblingCrowdloanCandidateBalances, useHistoricalOwnCrowdloanBalances, useAllOwnContributions, Contribution } from "./useQueries"
import { groupBy, inRange, find } from 'lodash';
import config from "src/config"
import { determineSiblingParachain } from "./useData"
import log from "loglevel"

/**
 * Calculate the BSX Multiplier & HDX Bonus for the given blockNum, auction and sibling/own valuations
 * 
 * @param blockNum 
 * @param curAuctionId 
 * @param curAuctionClosingStart 
 * @param curAuctionClosingEnd 
 * @param ownCrowdloanValuation 
 * @param siblingCrowdloanValuation 
 */
export const calculateIncentives = (
    blockNum: number,
    curAuctionId: number | null,
    curAuctionClosingStart: number | null,
    curAuctionClosingEnd: number | null,
    ownCrowdloanValuation: string | undefined,
    siblingCrowdloanValuation: string | undefined
) => {
    log.debug('calculateIncentives', {
        blockNum, curAuctionId, curAuctionClosingStart, curAuctionClosingEnd, ownCrowdloanValuation, siblingCrowdloanValuation
    });

    // if there is no own crowdloan, there are no incentives
    if (ownCrowdloanValuation == undefined) {
        log.debug('calculateIncentives', 'no ownCrowdloanValuation')
        return {
            hdxBonus: null,
            bsxMultiplier: null
        };
    }
    
    // calculate the bsx multiplier 
    let bsxMultiplier = calculateBsxMultiplier(
        blockNum,
        curAuctionId,
        curAuctionClosingStart,
        curAuctionClosingEnd
    );

    log.debug('calculateIncentives', 'calculateBsxMultiplier', bsxMultiplier);
    
    // determine if the auction is closing
    const isAuctionClosing = curAuctionClosingStart 
        ? (blockNum >= curAuctionClosingStart)
        : false

    log.debug('calculateIncentives', 'isAuctionClosing', isAuctionClosing);
    
    // calculate the hdx multiplier from own & sibling valuations
    let hdxBonus = calculateHdxMultiplier(
        new BigNumber(siblingCrowdloanValuation || 0),
        new BigNumber(ownCrowdloanValuation || 0),
        isAuctionClosing,
    );

    log.debug('calculateIncentives', 'hdxBonus', hdxBonus);
    
    const incentives = {
        hdxBonus: (new BigNumber(hdxBonus)).toFixed(config.ksmPrecision),
        bsxMultiplier: (new BigNumber(bsxMultiplier)).toFixed(config.ksmPrecision)
    };

    log.debug('calculateIncentives', 'incentives', incentives);

    return incentives;
}

/**
 * Hook providing the latest calculated incentives,
 * using existing own & sibling data.
 */
export const useIncentives = () => {
    let chronicle = useChronicle();
    let own = useOwn();
    let sibling = useSibling();
    
    const incentives = calculateIncentives(
        chronicle.data.curBlockNum,
        chronicle.data.curAuctionId,
        chronicle.data.curAuction?.closingStart,
        chronicle.data.curAuction?.closingEnd,
        own.data.crowdloan?.raised || undefined,
        sibling.data.crowdloan?.raised || undefined
    );

    // if there is no own crowdloan, return no incentives
    if (!own.data.crowdloan) return {
        hdxBonus: null,
        bsxMultiplier: null
    };

    return incentives;
}

/**
 * Find an auction that was active at the given blockNum.
 * This is useful to accurately present incentives from the contribution history.
 * @param blockNum 
 */
const findActiveHistoricalAuction = (blockNum: number) => {
    log.debug('findActiveHistoricalAuction', blockNum);
    const noAuctionId = 0;
    const activeAuctions = Object.keys(config.historicalAuctionData)
        .filter(auctionId => {
            const auctionData = (config.historicalAuctionData as any)[auctionId];
            return inRange(
                blockNum, 
                auctionData.blockNum, 
                auctionData.closingEnd
            )
        }) as unknown as number[]; // don't hurt me

    log.debug('findActiveHistoricalAuction', 'activeAuctions', activeAuctions);

    if (!activeAuctions || (activeAuctions && activeAuctions.length == 0)) {
        log.debug('findActiveHistoricalAuction', 'no active auction')
        return noAuctionId
    };

    if (activeAuctions.length > 1) {
        log.debug('findActiveHistoricalAuctions', 'more than 1 active auction found');
        throw new Error("More than 1 active historical auctions found");
    }

    const activeAuction = activeAuctions[0];

    log.debug('findActiveHistoricalAuctions', 'activeAuction', activeAuction);
    return activeAuction;
};

/**
 * In order to be able to calculate incentives for past blocks & contributions,
 * filter out auctions that have won an auction before the given blockNum.
 * @param blockNum
 */
const filterHistoricallyValidCrowdloanSiblingCandidates = (blockNum: number, crowdloanSiblingCandidates: any[]) => {
    log.debug('filterHistoricallyValidCrowdloanSiblingCandidates', blockNum, crowdloanSiblingCandidates);
    /**
     * If the crowdloan has won an auction already, and that auction
     * was scheduled to close at an earlier block than the candidate balance at hand,
     * then it is not valid for consideration.
     */
    // find an auction that was active at the given blockNum
    const activeAuctionId = findActiveHistoricalAuction(blockNum);
    log.debug('filterHistoricallyValidCrowdloanSiblingCandidates', 'activeAuctionId', activeAuctionId);
    const historicallyValidCrowdloanSiblingCandidates = crowdloanSiblingCandidates?.filter(crowdloanSiblingCandidate => {
        const wonAuctionId = crowdloanSiblingCandidate.fund.wonAuctionId;
        // if the sibling candidate has won an auction, that is older than the current auction at the given blockNum
        // then it is not eligible as a sibling
        if (wonAuctionId && wonAuctionId <= activeAuctionId) return false;
        return true;
    }) || [];

    log.debug('filterHistoricallyValidCrowdloanSiblingCandidates', historicallyValidCrowdloanSiblingCandidates);
    return historicallyValidCrowdloanSiblingCandidates;
}

/**
 * Hook that fetches all the data necessary to calculate historical incentives
 * for account contributions.
 */
export const useHistoricalIncentivesData = () => {
    const account = useAccount();
    const { dispatch } = useStoreContext();
    const contributions = account.data.contributions;
    const [blockNums, setBlockNums] = useState<number[]>([]);
    const [getHistoricalSiblingCrowdloanCandidateBalances, historicalSiblingCrowdloanCandidateBalances] = useHistoricalSiblingCrowdloanCandidateBalances(blockNums)
    const [getHistoricalOwnCrowdloanCandidateBalances, historicalOwnCrowdloanCandidateBalances] = useHistoricalOwnCrowdloanBalances(blockNums);
    const historicalIncentives = useHistoricalIncentives();

    /**
     * When there are new contributions, set the blockNums which
     * we need to calculate incentives for.
     */
    useEffect(() => {
        if (!contributions) return;
        if (contributions && !contributions.length) return;
        const contributionBlockNums = contributions.map(contribution => contribution.blockNum);
        setBlockNums(contributionBlockNums);
        log.debug('useHistoricalIncentivesData', 'blockNums', contributionBlockNums);
        dispatch({
            type: ActionType.LoadHistoricalIncentivesData
        });
    }, [
        contributions
    ]);

    /**
     * Fetch historical balances for own & sibling,
     * based on the account contribution blocks.
     */
    useEffect(() => {
        if (!blockNums) return;
        if (blockNums && !blockNums.length) return;
        if (!historicalIncentives.loading) return;
        if (historicalSiblingCrowdloanCandidateBalances.loading) return;
        if (historicalOwnCrowdloanCandidateBalances.loading) return;
        log.debug('useHistoricalIncentivesData', 'fetching historical balances for own & sibling');
        getHistoricalSiblingCrowdloanCandidateBalances()
        getHistoricalOwnCrowdloanCandidateBalances()
    }, [
        historicalIncentives.loading,
        historicalSiblingCrowdloanCandidateBalances,
        getHistoricalSiblingCrowdloanCandidateBalances,
        getHistoricalOwnCrowdloanCandidateBalances,
        historicalOwnCrowdloanCandidateBalances
    ])

    /**
     * After we fetch the historical balances, recalculate all the historical incentives.
     */
    useEffect(() => {
        if (!historicalSiblingCrowdloanCandidateBalances.called || historicalSiblingCrowdloanCandidateBalances.loading) return;
        if (!historicalOwnCrowdloanCandidateBalances.called || historicalOwnCrowdloanCandidateBalances.loading) return;

        log.debug('useHistoricalIncentivesData', 'calculating historican incentives for each contribution block');

        // split sibling crowdloan candidates into groups by blockNum
        const candidateCrowdloansHistoricalBalances = groupBy(
            historicalSiblingCrowdloanCandidateBalances.data.aggregatedCrowdloanBalances.nodes,
            'blockNum'
        );
        
        // split own crowdloan balances by blockNum
        const ownCrowdloansHistoricalBalances = groupBy(
            historicalOwnCrowdloanCandidateBalances.data.aggregatedCrowdloanBalances.nodes,
            'blockNum'
        );

        log.debug('useHistoricalIncentivesData', 'historicalBalances', candidateCrowdloansHistoricalBalances, ownCrowdloansHistoricalBalances);
        
        // filter out sibling crowdloan candidates that are not valid
        const validHistoricalCrowdloanCandidates = blockNums.reduce((accumulator, blockNum) => {
            (accumulator as any)[blockNum] = filterHistoricallyValidCrowdloanSiblingCandidates(
                blockNum,
                candidateCrowdloansHistoricalBalances[blockNum]
            )
            return accumulator;
        }, {});

        log.debug('useHistoricalIncentivesData', 'validHistoricalCrowdloanCandidates', validHistoricalCrowdloanCandidates);

        /**
         * Calculate *only* the historical HDX Bonus, since BSX bonus can be calculated on the fly.
         */
        const historicalIncentives = blockNums.reduce((accumulator, blockNum) => {
            // find a siblingParachainId by providing the activeAuctionId at the time
            const activeAuctionId = findActiveHistoricalAuction(blockNum);
            const siblingParachainId = determineSiblingParachain(
                (validHistoricalCrowdloanCandidates as any)[blockNum],
                activeAuctionId
            );
            const ownCrowdloan = (ownCrowdloansHistoricalBalances as any)[blockNum][0];

            log.debug('useHistoricalIncentivesData', 'calculating', {
                activeAuctionId,
                siblingParachainId,
                ownCrowdloan
            });

            if (!ownCrowdloan) return accumulator;

            // auction data by historically active auctionId
            const activeAuction = (config.historicalAuctionData as any)[activeAuctionId];

            log.debug('useHistoricalIncentivesData', 'activeAuction', activeAuction);

            // find the siblingParachainCrowdloan data by siblingParachainId
            const siblingParachainCrowdloan = find(
                (validHistoricalCrowdloanCandidates as any)[blockNum],
                ['parachainId', siblingParachainId]
            );
            
            log.debug('useHistoricalIncentivesData', 'own vs sibling raised', {
                sibling: siblingParachainCrowdloan?.raised,
                own: ownCrowdloan?.raised
            });

            // recalculate incentives (hdx bonus) for the given blockNum,
            // while taking the historically active auctionId into consideration
            (accumulator as any)[blockNum] = {
                hdxBonus: calculateIncentives(
                    blockNum,
                    activeAuctionId,
                    activeAuction?.closingStart,
                    activeAuction?.closingEnd,
                    ownCrowdloan?.raised,
                    siblingParachainCrowdloan?.raised
                ).hdxBonus,
                blockNum,
                siblingParachainId
            }

            log.debug('useHistoricalIncentivesData', 'resulting historical incentive', blockNum, (accumulator as any)[blockNum]);
            return accumulator;
        }, {});
        
        dispatch({
            type: ActionType.SetHistoricalIncentivesData,
            payload: historicalIncentives
        })
    }, [
        historicalSiblingCrowdloanCandidateBalances,
        historicalOwnCrowdloanCandidateBalances
    ]);

    return historicalIncentives;
}

/**
 * Calculate the minimum Bsx received given a crowdloan cap
 * and an array of account contributions
 * @param cap
 * @param contributions 
 * @param chronicle 
 */
export const calculateMinBsxReceived = (
    cap: string,
    contributions: any[],
    chronicle: any,
) => {

    // sum up weights of the given contributions
    const contributionsWeight = contributions.reduce((accumulator, contribution: Contribution) => {
        const bsxMultiplier = calculateBsxMultiplier(
            contribution.blockNum,
            chronicle.data.curAuctionId,
            chronicle.data.curAuction.closingStart,
            chronicle.data.curAuction.closingEnd
        );

        log.debug('useCalculateRewardsReceived', 'accountWeight bsxMultiplier', bsxMultiplier, {
            blockNum: contribution.blockNum,
            curAuctionId: chronicle.data.curAuctionId,
            closingStart: chronicle.data.curAuction.closingStart,
            closingEnd: chronicle.data.curAuction.closingEnd
        });
        
        return new BigNumber(accumulator)
            .plus((
                // calculate the invididual contribution weight
                (new BigNumber(contribution.amount))
                    .multipliedBy(bsxMultiplier)
            ))
            .toFixed(config.incentives.precision)
    }, "0");

    // calculate the minimum Bsx received with respect to the own crowdloan cap
    const minBsxReceived = new BigNumber(config.incentives.bsx.allocated)
        .dividedBy(
            // maximum reward multiplier for the full crowdloan cap
            (new BigNumber(cap))
                .multipliedBy(config.incentives.bsx.scale.rewardMultiplier.min)
        )
        .multipliedBy(contributionsWeight)
        .toFixed(config.incentives.precision)   

    return minBsxReceived;
}

/**
 * Calculate the current Bsx received with regards
 * to the weight of other contributions
 * @param totalContributionWeight 
 * @param contributions 
 * @param chronicle 
 */
export const calculateCurrentBsxReceived = (
    totalContributionWeight: string,
    contributions: any[],
    chronicle: any,
) => {

    // calculate the weight of the given account contributions
    const contributionsWeight = contributions.reduce((accumulator, contribution: Contribution) => {
        const bsxMultiplier = calculateBsxMultiplier(
            contribution.blockNum,
            chronicle.data.curAuctionId,
            chronicle.data.curAuction.closingStart,
            chronicle.data.curAuction.closingEnd
        );

        log.debug('useCalculateRewardsReceived', 'accountWeight bsxMultiplier', bsxMultiplier, {
            blockNum: contribution.blockNum,
            curAuctionId: chronicle.data.curAuctionId,
            closingStart: chronicle.data.curAuction.closingStart,
            closingEnd: chronicle.data.curAuction.closingEnd
        });

        return new BigNumber(accumulator)
            .plus((
                // weight of the given contribution using the bsx multiplier
                (new BigNumber(contribution.amount))
                    .multipliedBy(bsxMultiplier)
            ))
            .toFixed(config.incentives.precision)
    }, "0");

    // current bsx received with respect to the total contributions weight
    const accountCurrentBsxReward = new BigNumber(config.incentives.bsx.allocated)
        .dividedBy(totalContributionWeight)
        .multipliedBy(contributionsWeight)
        .toFixed(config.incentives.precision); 

    return accountCurrentBsxReward
}

/**
 * Calculate the current HDX reward for the given account contributions,
 * using HDX Bonuses calculated for the past contribution blockNums
 * @param contributions 
 * @param historicalIncentives 
 */
const calculateCurrentHdxReward = (
    contributions: any[],
    historicalIncentives: any
) => {
    const hdxReward = contributions.reduce((accumulator, contribution: Contribution) => {
        log.debug('useCalculateRewardsReceived', 'hdxReward', 'contribution', contribution, historicalIncentives.data[contribution.blockNum]);
        const ksmOpportunityCostPerContribution = (new BigNumber(contribution.amount))
            .multipliedBy(
                config.ksmOpportunityCost
            );

        log.debug('useCalculateRewardsReceived', 'hdxReward', 'ksmOpportunityCostPerContribution', ksmOpportunityCostPerContribution);
        const contributionHdxReward = ksmOpportunityCostPerContribution
            .multipliedBy(
                historicalIncentives.data[contribution.blockNum].hdxBonus
            );
            
        log.debug('useCalculateRewardsReceived', 'hdxReward', 'contributionHdxReward', contributionHdxReward);

        return new BigNumber(accumulator)
            .plus(contributionHdxReward)
            .toFixed(config.incentives.precision)
    }, "0");

    return hdxReward;
}

const calculateBsxRewards = (
    contributions: any[],
    chronicle: any,
    totalContributionWeight: string,
    own: any,
) => {
    const accountWeight = contributions.reduce((accumulator, contribution: Contribution) => {
        const bsxMultiplier = calculateBsxMultiplier(
            contribution.blockNum,
            chronicle.data.curAuctionId,
            chronicle.data.curAuction.closingStart,
            chronicle.data.curAuction.closingEnd
        );

        log.debug('useCalculateRewardsReceived', 'accountWeight bsxMultiplier', bsxMultiplier, {
            blockNum: contribution.blockNum,
            curAuctionId: chronicle.data.curAuctionId,
            closingStart: chronicle.data.curAuction.closingStart,
            closingEnd: chronicle.data.curAuction.closingEnd
        });

        return new BigNumber(accumulator)
            .plus((
                (new BigNumber(contribution.amount))
                    .multipliedBy(bsxMultiplier)
            ))
            .toFixed(config.incentives.precision)
    }, "0");

    log.debug('useCalculateRewardsReceived', 'accountWeight', accountWeight);
    log.debug('useCalculateRewardsReceived', 'totalContributionWeight', totalContributionWeight);

    const accountCurrentBsxReward = calculateCurrentBsxReceived(
        totalContributionWeight,
        contributions,
        chronicle
    );

    log.debug('useCalculateRewardsReceived', 'accountCurrentBsxReward', accountCurrentBsxReward);

    const accountMinimumBsxReward = calculateMinBsxReceived(
        own.data.crowdloan.cap,
        contributions,
        chronicle
    )
        
    log.debug('useCalculateRewardsReceived', 'accountMinimumBsxReward', accountMinimumBsxReward);
    
    return {
        accountCurrentBsxReward,
        accountMinimumBsxReward
    }
}

/**
 * Hook to calculate minimal/current BSX rewards & current HDX rewards,
 * based on the existing account contributions.
 */
export const useCalculateRewardsReceived = () => {
    const contributions = useContributions();
    const chronicle = useChronicle();

    const historicalIncentives = useHistoricalIncentivesData()
    const [getAllOwnContributions, allOwnContributions] = useAllOwnContributions();
    const [totalContributionWeight, setTotalContributionWeight] = useState("0");
    const [currentBsxReceived, setCurrentBsxReceived] = useState("0");
    const [minimalBsxReceived, setMinimalBsxReceived] = useState("0");
    const [currentHdxReceived, setCurrentHdxReceived] = useState("0");
    const own = useOwn();

    // TODO: add loading state (!)
    /**
     * When the curBlockNum changed, load all account contributions to our crowdloan
     */
    useEffect(() => {
        log.debug('useCalculateRewardsReceived', 'getAllOwnContributions', 'fetching')
        getAllOwnContributions();
    }, [
        chronicle.data.curBlockNum
    ]);

    /**
     * Calculate the total weight of all contributions to our own crowdloan.
     */
    // TODO: use data from indexer
    useEffect(() => {
        if (!allOwnContributions.called || allOwnContributions.loading) return;
        log.debug('useCalculateRewardsReceived', 'totalContributionWeight', 'calculating')
        const totalContributionWeight = allOwnContributions.data.contributions.nodes
            .reduce((accumulator: string, contribution: any) => {
                /**
                 * BSX Multiplier needs to be calculated for the past blockNum when the contribution was made.
                 * We still use the curAuction, since the `calculateBsxMultiplier` can handle past blockNums well.
                 */
                const bsxMultiplier = calculateBsxMultiplier(
                    contribution.blockNum,
                    chronicle.data.curAuctionId,
                    chronicle.data.curAuction.closingStart,
                    chronicle.data.curAuction.closingEnd
                );

                log.debug('useCalculateRewardsReceived', 'bsxMultiplier', bsxMultiplier, {
                    blockNum: contribution.blockNum,
                    curAuctionId: chronicle.data.curAuctionId,
                    closingStart: chronicle.data.curAuction.closingStart,
                    closingEnd: chronicle.data.curAuction.closingEnd
                });

                // weight of the individual contribution
                const contributionWeight = new BigNumber(contribution.amount)
                    .multipliedBy(bsxMultiplier)
                    .toFixed(config.incentives.precision);

                // individual contribution weight added to the total contributions weight
                return new BigNumber(accumulator)
                    .plus(contributionWeight)
                    .toFixed(config.incentives.precision);
            }, "0")

        log.debug('useCalculateRewardsReceived', 'totalContributionWeight', totalContributionWeight)
        setTotalContributionWeight(totalContributionWeight);
    }, [
        allOwnContributions.loading,
        allOwnContributions.called,
        allOwnContributions.data
    ]);

    useEffect(() => {
        if (!own.data.crowdloan?.cap) return;
        if (historicalIncentives.loading) return;
        // there are no historical incentives data
        if (!Object.keys(historicalIncentives.data).length) return;

        /**
         * Calculate BSX rewards
         */
        const { accountCurrentBsxReward, accountMinimumBsxReward } = calculateBsxRewards(
            contributions,
            chronicle,
            totalContributionWeight,
            own
        );

        // values in BSX, not in KSM
        setCurrentBsxReceived(accountCurrentBsxReward)
        setMinimalBsxReceived(accountMinimumBsxReward);

        /**
         * Calculate HDX rewards
         */
        const hdxReward = calculateCurrentHdxReward(
            contributions,
            historicalIncentives
        );

        log.debug('useCalculateRewardsReceived', 'hdxReward', hdxReward);

        // hdx value in KSM, not converted yet
        setCurrentHdxReceived(hdxReward);
        console.log('hdx reward', hdxReward)
    }, [
        totalContributionWeight,
        historicalIncentives.loading,
        historicalIncentives.data,
        contributions,
        own.data.crowdloan?.cap
    ]);

    return {
        currentBsxReceived,
        minimalBsxReceived,
        currentHdxReceived
    }
}