import React, { useEffect, useMemo } from 'react';
import constate from 'constate';
import { AggregatedCrowdloanBalance, Crowdloan } from 'src/hooks/data';
import { every, initial } from 'lodash';
import { ActionType, Action, SetChronicle, SetOwnData } from './Actions';

export type ParachainCrowdloanState = {
    crowdloan: null | Crowdloan,
    aggregatedCrowdloanBalances: null | AggregatedCrowdloanBalance[]
}

export type Chronicle = {
    curBlockNum: null | number
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
            curBlockNum: null,
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

        default:
            return initialState;
    }
};

const useStore = () => {
    const [state, dispatch] = React.useReducer(reducer, initialState);
    return { state, dispatch };
}

const [StoreProvider, useStoreContext] = constate(useStore);

const useIsLoading = () => {
    const { state } = useStoreContext();
    
    return useMemo(() => (
        state.chronicle.loading
        || state.own.loading
    ), [
        state.chronicle.loading,
        state.own.loading,
    ])
}

export {
    StoreProvider,
    useStoreContext,
    ActionType,
    useIsLoading
}