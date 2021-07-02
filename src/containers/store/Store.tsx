import { useEffect, useReducer, useState } from 'react';
import constate from 'constate';
import { AggregatedCrowdloanBalance, Crowdloan, Chronicle } from 'src/hooks/useQueries';
import { ActionType, Action, SetChronicle, SetOwnData, SetSiblingData } from './Actions';
import log from 'loglevel';

export type ParachainCrowdloanState = {
    crowdloan: null | Crowdloan,
    aggregatedCrowdloanBalances: null | AggregatedCrowdloanBalance[]
}

export type State = {
    chronicle: {
        loading: boolean,
        data: Chronicle
    },
    own: {
        loading: boolean,
        data: ParachainCrowdloanState
    }
    sibling: {
        loading: boolean,
        data: ParachainCrowdloanState
    }
}

const initialState: State = {
    chronicle: {
        loading: false,
        data: {
            curBlockNum: 0,
            curAuctionId: 0,
            curAuction: {
                closingStart: null,
                closingEnd: null
            }
        }
    },
    own: {
        loading: false,
        data: {
            crowdloan: null,
            aggregatedCrowdloanBalances: []
        }
    },
    sibling: {
        loading: false,
        data: {
            crowdloan: null,
            aggregatedCrowdloanBalances: []
        }
    }
};

const reducer = (state: State, action: Action) => {
    log.debug('Store', 'action', action, state);
    const newState = (() => {
        switch (action.type) {
            /**
             * Chronicle
             */
            case ActionType.LoadChronicle:
                return {
                    ...state,
                    chronicle: {
                        ...state.chronicle,
                        loading: true
                    }
                }
            case ActionType.SetChronicle:
                return {
                    ...state,
                    chronicle: {
                        ...state.chronicle,
                        loading: false,
                        // TODO: figure out how to use type union without having to type cast
                        data: (action as SetChronicle).payload
                    }
                }
    
            case ActionType.LoadOwnData:
                return {
                    ...state,
                    own: {
                        ...state.own,
                        loading: true
                    }
                }
    
            case ActionType.SetOwnData:
                return {
                    ...state,
                    own: {
                        ...state.own,
                        loading: false,
                        data: (action as SetOwnData).payload
                    }
                }

            case ActionType.LoadSiblingData:
                return {
                    ...state,
                    sibling: {
                        ...state.sibling,
                        loading: true
                    }
                }

            case ActionType.SetSiblingData:
                return {
                    ...state,
                    sibling: {
                        loading: false,
                        data: (action as SetSiblingData).payload,
                    }
                }
    
            default:
                return initialState;
        }
    })()

    log.debug('Store', 'newState', newState);
    return newState;
};

const useStore = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    return { state, dispatch };
}

const [StoreProvider, useStoreContext] = constate(useStore);

const useIsLoading = () => {
    const { state } = useStoreContext();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        log.debug('useIsLoading', state.chronicle.loading, state.own.loading, (
            state.chronicle.loading
            || state.own.loading
        ));
        setLoading((
            state.chronicle.loading
            || state.own.loading
        ))
    }, [
        state.chronicle.loading,
        state.own.loading,
    ])

    return loading;
}

const useChronicle = () => {
    const { state } = useStoreContext();
    return state.chronicle;
}

const useOwn = () => {
    const { state } = useStoreContext();
    return state.own;
}

const useSibling = () => {
    const { state } = useStoreContext();
    return state.sibling;
}

export {
    StoreProvider,
    useStoreContext,
    ActionType,
    useIsLoading,
    useChronicle,
    useOwn,
    useSibling
}