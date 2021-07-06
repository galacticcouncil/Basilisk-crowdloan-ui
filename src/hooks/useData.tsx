import { useChronicleQuery, useOwnAggregatedCrowdloanBalancesQuery, useOwnCrowdloanQuery, AggregatedCrowdloanBalance, useSiblingCrowdloanCandidatesQuery, useAggregatedCrowdloanBalancesByParachainIdQuery, useCrowdloanByParachainIdQuery, useContributionsByAccountAndParachainId, getContributionsByAccountAndParachainId } from './useQueries';
import { useEffect, useState } from 'react';
import { every } from 'lodash';
import { ActionType, useAccount, useContributions, useStoreContext } from 'src/containers/store/Store';
import { useChronicle, useSibling, useOwn } from '../containers/store/Store';
import log from 'loglevel';
import config from 'src/config';

/**
 * Hook to get & set latest chronicle from the indexer.
 * Observes `chronicle.loading` as a trigger to start loading
 * the latest chronicle.
 */
const useChronicleData = () => {
    // use the lazy chronicle query
    const [getChronicle, chronicle] = useChronicleQuery()
    // we will save the new chronicle to the store
    const { state, dispatch } = useStoreContext()

    /**
     * Watch `state.chronicle.loading`, if it changes to `true`
     * then run the getChronicle query.
     */
    useEffect(() => {
        log.debug('useChronicleData', 'state.chronicle.loading', state.chronicle.loading)
        if (state.chronicle.loading) getChronicle();
    }, [
        state.chronicle.loading,
        getChronicle
    ])

    useEffect(() => {
        const intervalId = setInterval(() => {
            console.log('getting chronicle')
            getChronicle()
        }, config.blockTime);
        return () => {
            console.log('clearning')
            clearInterval(intervalId)
        };
    }, [])

    /**
     * Watch `chronicle` data from the `getChronicle` query.
     * When it changes while the query has finished loading,
     * save the chronicle to the store.
     */
    useEffect(() => {
        // TODO: also check for errors 
        if (!chronicle.called || chronicle.loading) return;
        log.debug('useChronicleData', 'chronicle', chronicle)
        console.log(chronicle.data.chronicle.curBlockNum)
        if(!chronicle.data) return;

        dispatch({
            type: ActionType.SetChronicle,
            payload: {
                curBlockNum: chronicle.data.chronicle.curBlockNum,
                curAuctionId: chronicle.data.chronicle.curAuctionId 
                    ? parseInt(chronicle.data.chronicle.curAuctionId)
                    : 0,
                curAuction: {
                    closingStart: chronicle.data.chronicle.curAuction?.closingStart,
                    closingEnd: chronicle.data.chronicle.curAuction?.closingEnd,
                    blockNum: chronicle.data.chronicle.curAuction?.blockNum,
                }
            }
        })
    }, [
        chronicle,
        dispatch
    ])

    return {
        chronicle: state.chronicle
    };
}

/**
 * Hook to fetch both own crowdloan data & own aggregated crowdloan balances (for the graph)
 * Observes `chronicle.data.curBlockNum`
 */
const useOwnData = () => {
    // use own crowdloan & own aggregated crowdloan balances queries
    const [getOwnCrowdloan, ownCrowdloan] = useOwnCrowdloanQuery();
    const [getOwnAggregatedCrowdloanBalances, ownCrowdloanAggregatedBalances] = useOwnAggregatedCrowdloanBalancesQuery()
    // we will store the result of the query calls in the store
    const { dispatch } = useStoreContext();
    // use the chronicle as a trigger for own data fetching
    const chronicle = useChronicle();
    const own = useOwn();

    /**
     * Watch `chronicle.data.curBlockNum` and when it changes,
     * trigger fetching of our own crowdloan & aggregated balances data.
     */
    useEffect(() => {
        log.debug('useOwnData', 'chronicle changed, loading own data', ownCrowdloan.loading, ownCrowdloanAggregatedBalances.loading);
        // TODO: error handling
        if (ownCrowdloan.loading || ownCrowdloanAggregatedBalances.loading) return;
        dispatch({
            type: ActionType.LoadOwnData
        });
    }, [
        chronicle.data.curBlockNum,
        ownCrowdloan.loading,
        ownCrowdloanAggregatedBalances.loading,
        dispatch
    ])

    /**
     * Watch `state.own.loading` and when it changes, run all
     * the necessary queries for own data.
     */
    useEffect(() => {
        log.debug('useOwnData', 'state.own.loading', own.loading);
        if (!own.loading) return;
        log.debug('useOwnData', 'getOwnCrowdloan');
        getOwnCrowdloan();
        // TODO: split it up because aggregated crowdloan balance requires blockNum from ownCrowdloan
        // alternatively just use a fixed blockNum from config for now
        log.debug('useOwnData', 'getOwnCrowgetOwnAggregatedCrowdloanBalancesdloan');
        getOwnAggregatedCrowdloanBalances();
    }, [
        own.loading,
        getOwnCrowdloan,
        getOwnAggregatedCrowdloanBalances
    ])

    /**
     * Determine if own data is loading by combining loading states
     * of all the subsequent queries
     */
    const loading = every([
        ownCrowdloan.loading,
        ownCrowdloanAggregatedBalances.loading,
        !ownCrowdloanAggregatedBalances.called
    ]);

    log.debug('useOwnData', 'loading', loading);

    /**
     * Watch all own data queries, and when they finish,
     * parse the received data into a format required for the global data store
     * and save it.
     */
    useEffect(() => {
        if (!ownCrowdloan.called || ownCrowdloan.loading) return;
        if (!ownCrowdloanAggregatedBalances.called || ownCrowdloanAggregatedBalances.loading) return;
        
        // TODO: add error handling
        log.debug('useOwnData', 'ownCrowdloan', ownCrowdloan)
        log.debug('useOwnData', 'ownCrowdloanAggregatedBalances', ownCrowdloanAggregatedBalances)

        if (!ownCrowdloan.data) return;

        let crowdloan = ownCrowdloan.data.crowdloans.nodes[0];
        crowdloan = {
            id: crowdloan.id,
            parachainId: crowdloan.parachainId,
            raised: crowdloan.raised,
            cap: crowdloan.cap,
            blockNum: crowdloan.blockNum
        };

        let aggregatedCrowdloanBalances = ownCrowdloanAggregatedBalances
            .data
            ?.aggregatedCrowdloanBalances
            .nodes
            .map(({ id, blockNum, raised, parachainId }: AggregatedCrowdloanBalance) => ({
                id, blockNum, raised, parachainId
            }));

        log.debug('useOwnData', 'crowdloan', crowdloan)
        log.debug('useOwndata', 'aggregatedCrowdloanBalances', aggregatedCrowdloanBalances)

        // load sibling data before setting own as loaded
        dispatch({
            type: ActionType.LoadSiblingData
        })

        dispatch({
            type: ActionType.SetOwnData,
            payload: {
                crowdloan,
                aggregatedCrowdloanBalances
            }
        })
    }, [
        ownCrowdloan, 
        ownCrowdloanAggregatedBalances, 
        loading,
        dispatch
    ])

    return {
        own,
        ownLoading: loading
    }
}

/**
 * TODO: add auction bids into the equation, not just crowdloan balances
 * TODO: make sure this logic works out
 * @param siblingCrowdloanCandidates 
 * @param ownValuation 
 */
const determineSiblingParachain = (
    siblingCrowdloanCandidates: any,
    curAuctionId: null | number
) => {
    log.debug('determineSiblingParachain', siblingCrowdloanCandidates, curAuctionId);
    const siblingCandidates = siblingCrowdloanCandidates
        .map((siblingCrowdloanCandidate: any) => ({
            valuation: siblingCrowdloanCandidate.raised,
            parachainId: siblingCrowdloanCandidate.parachainId
        })) || [];

    /**
     * If we're not in the target auction yet, then our competitor
     * is the parachain with the second largest valuation, instead of the first one.
     * This is because the first one is presumed to win the current auction,
     * and therefore not compete with us in the target auction.
     */
    const siblingParachain = ((curAuctionId || 0) < config.targetAuctionId)
        ? siblingCandidates[1]
        : siblingCandidates[0];

    log.debug('determineSiblingParachain', 'siblingParachain', siblingParachain?.parachainId);
    return siblingParachain?.parachainId;
}

/**
 * Hook used to determine who the sibling parachain is,
 * based on 'own' and sibling candidates data.
 * 
 * TODO: factor in bid size, not only crowdloan size
 */
const useSiblingData = () => {
    const chronicle = useChronicle();
    const own = useOwn()
    const { dispatch } = useStoreContext()
    const sibling = useSibling();
    
    const [getSiblingCrowdloanCandidates, siblingCrowdloanCandidates] = useSiblingCrowdloanCandidatesQuery();
    
    const [siblingParachainId, setSiblingParachainId] = useState("");
    // TODO: fetch latest data from the node, instead of the indexer
    // in order to provide the most accurate reward estimates
    const [getSiblingCrowdloan, siblingCrowdloan] = useCrowdloanByParachainIdQuery(siblingParachainId);
    const [getAggregatedSiblingCrowdloanBalances, aggregatedSiblingCrowdloanBalances] = useAggregatedCrowdloanBalancesByParachainIdQuery({
        parachainId: siblingParachainId
    })

    const loading = every([
        siblingCrowdloan.loading,
        !siblingCrowdloan.called,
        aggregatedSiblingCrowdloanBalances.loading,
        !aggregatedSiblingCrowdloanBalances.called
    ]);
    
    useEffect(() => {
        // don't do anything in case we don't know the `curBlockNum` yet
        if (!chronicle.data.curBlockNum) return;
        if (!sibling.loading) return;
        if (siblingCrowdloan.loading) return;
        if (siblingCrowdloanCandidates.loading) return;
        log.debug('useSiblingData', 'getSiblingCrowdloanCandidates')
        getSiblingCrowdloanCandidates();
    }, [
        chronicle.data.curBlockNum,
        sibling.loading,
        getSiblingCrowdloanCandidates
    ]);
    
    useEffect(() => {
        if (own.loading || !own.data.crowdloan) return;
        if (!chronicle.data.curBlockNum) return;
        if (!siblingCrowdloanCandidates.called || siblingCrowdloanCandidates.loading) return;

        log.debug('useSiblingData', 'loaded', 'determining sibling parachain');

        const siblingParachainId = determineSiblingParachain(
            siblingCrowdloanCandidates.data?.crowdloans.nodes,
            chronicle.data?.curAuctionId
        );
        
        // TODO: if siblingParachainId is undefined, this hook never 'stops loading'
        setSiblingParachainId(siblingParachainId);
    }, [
        siblingCrowdloanCandidates,
        chronicle.data?.curAuctionId,
        own.data.crowdloan,
        own.loading
    ]);

    /**
     * When the siblingParachainId or curBlockNum changes, fetch its crowdloan data
     * 
     * NOTE: This hook is a bit tricky, it executes both when the curBlockNum changes and
     * also independently when the siblingParachainId changes.
     */
    useEffect(() => {
        if (!siblingParachainId) return;
        if (!chronicle.data.curBlockNum) return;
        if (!sibling.loading) return;
        // if (!sibling.loading) return;
        log.debug('useSiblingData', 'fetching sibling data');
        getAggregatedSiblingCrowdloanBalances()
        getSiblingCrowdloan()
    }, [
        siblingParachainId,
        chronicle.data.curBlockNum,
        sibling.loading,
    ])

    useEffect(() => {
        if (!siblingCrowdloan.called || siblingCrowdloan.loading) return;
        if (!aggregatedSiblingCrowdloanBalances.called || aggregatedSiblingCrowdloanBalances.loading) return;

        log.debug('useSiblingData', 'fetched sibling data', 'parsing');

        let crowdloan = siblingCrowdloan.data.crowdloans.nodes[0];
        crowdloan = {
            id: crowdloan.id,
            parachainId: crowdloan.parachainId,
            raised: crowdloan.raised,
            cap: crowdloan.cap,
            blockNum: crowdloan.blockNum
        };

        let aggregatedCrowdloanBalances = aggregatedSiblingCrowdloanBalances
            .data
            ?.aggregatedCrowdloanBalances
            .nodes
            .map(({ id, blockNum, raised, parachainId }: AggregatedCrowdloanBalance) => ({
                id, blockNum, raised, parachainId
            }));
        
        log.debug('useSiblingData', 'setting sibling data');

        dispatch({
            type: ActionType.SetSiblingData,
            payload: {
                crowdloan,
                aggregatedCrowdloanBalances
            }
        })

    }, [
        aggregatedSiblingCrowdloanBalances,
        siblingCrowdloan
    ])

    return {
        sibling,
        siblingLoading: loading
    }
}




export {
    useChronicleData,
    useOwnData,
    useSiblingData,
    determineSiblingParachain
}