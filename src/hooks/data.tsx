import { useChronicle, useOwnAggregatedCrowdloanBalances, useOwnCrowdloan } from '../hooks/queries';
import { useEffect, useMemo } from 'react';
import { every } from 'lodash';
import { ActionType, useStoreContext } from 'src/containers/store/Store';

export type Crowdloan = {
    id: string,
    cap: number,
    raised: number,
    parachainId: string
}

export type AggregatedCrowdloanBalance = {
    id: string,
    blockNum: number,
    raised: number,
    parachainId: string
}

const useOwnData = () => {
    const [getOwnCrowdloan, ownCrowdloan] = useOwnCrowdloan();
    const [getOwnAggregatedCrowdloanBalances, ownCrowdloanAggregatedBalances] = useOwnAggregatedCrowdloanBalances()
    
    const { state, dispatch } = useStoreContext();

    useEffect(() => {
        if (!state.own.loading) return;
        getOwnCrowdloan();
        // TODO: split it up because aggregated crowdloan balance requires blockNum from ownCrowdloan
        // alternatively just use a fixed blockNum from config for now
        getOwnAggregatedCrowdloanBalances();
    }, [state.own.loading])

    const loading = every([
        ownCrowdloan.loading,
        ownCrowdloanAggregatedBalances.loading
    ]);

    useEffect(() => {
        if (!ownCrowdloan.called || ownCrowdloan.loading) return;
        if (!ownCrowdloanAggregatedBalances.called || ownCrowdloanAggregatedBalances.loading) return;
        // TODO: add error handling
        
        let crowdloan = ownCrowdloan.data.crowdloans.nodes[0];
        let aggregatedCrowdloanBalances = ownCrowdloanAggregatedBalances
            .data
            ?.aggregatedCrowdloanBalances
            .nodes
            .map(({ id, blockNum, raised, parachainId }: AggregatedCrowdloanBalance) => ({
                id, blockNum, raised, parachainId
            }));

        dispatch({
            type: ActionType.SetOwnData,
            payload: {
                crowdloan: {
                    id: crowdloan.id,
                    parachainId: crowdloan.parachainId,
                    raised: crowdloan.raised,
                    cap: crowdloan.cap
                },
                aggregatedCrowdloanBalances
            }
        })
    }, [ownCrowdloan, ownCrowdloanAggregatedBalances, loading])

    return {
        own: state.own
    }
}

// TODO: split into a dumb/smart chronicleData hook
// smart hook will also fetch data when necessary, dumb will only display what is in the storage
const useChronicleData = () => {
    const [getChronicle, chronicle] = useChronicle()
    const { state, dispatch } = useStoreContext()

    useEffect(() => {
        if (!state.chronicle.loading) return;
        console.log('loading new chronicle')
        getChronicle()
    }, [state.chronicle.loading])

    useEffect(() => {
        if (!chronicle.called || chronicle.loading) return;
        console.log('setting new chronicle', chronicle.data.chronicle.curBlockNum)
        dispatch({
            type: ActionType.SetChronicle,
            payload: {
                curBlockNum: chronicle.data.chronicle.curBlockNum
            }
        })
    }, [chronicle])

    return {
        chronicle: state.chronicle
    };
}

export {
    useChronicleData,
    useOwnData
}