import { useReducer } from 'react';
import constate from 'constate';
import { AggregatedCrowdloanBalance, Crowdloan, Chronicle, Contribution } from 'src/hooks/useQueries';
import { ActionType, Action, SetChronicle, SetOwnData, SetSiblingData, SetAccountData, SetHistoricalIncentivesData } from './Actions';
import log from 'loglevel';

export type ParachainCrowdloanState = {
    crowdloan: null | Crowdloan,
    aggregatedCrowdloanBalances: null | AggregatedCrowdloanBalance[]
};

export type AccountState = {
    address: null | string,
    balance: null | string,
    contributions: Contribution[]
};

export interface Incentive {
    hdxBonus: string,
    blockNum: number,
    siblingParachainId: string
}

export interface HistoricalIncentives {
    [blockNum: number]: Incentive
}

export interface Rewards {
    currentBsxReceived: null | string,
    minimalBsxReceived: null | string,
    currentHdxReceived: null | string
}

export type State = {
    account: {
        loading: boolean,
        data: AccountState
    },
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
    },
    historicalIncentives: {
        loading: boolean,
        data: HistoricalIncentives
    }
};

const initialState: State = {
    account: {
        loading: false,
        data: {
            address: null,
            balance: "0",
            contributions: []
        }
    },
    chronicle: {
        loading: false,
        data: {
            curBlockNum: 0,
            curAuctionId: 0,
            curAuction: {
                closingStart: null,
                closingEnd: null,
                blockNum: null
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
    },
    historicalIncentives: {
        loading: false,
        data: {}
    }
};

const reducer = (state: State, action: Action) => {
    log.debug('Store', 'action', action.type, action.payload, state);
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

            case ActionType.ConnectAccount:
                return {
                    ...state,
                    account: {
                        ...initialState.account,
                        loading: true,
                    }
                }
                

            case ActionType.SetAccountData:
                return {
                    ...state,
                    account: {
                        ...state.account,
                        loading: false,
                        data: (action as SetAccountData).payload
                    }
                }

            case ActionType.LoadHistoricalIncentivesData:
                return {
                    ...state,
                    historicalIncentives: {
                        ...state.historicalIncentives,
                        loading: true
                    }
                }

            case ActionType.SetHistoricalIncentivesData:
                return {
                    ...state,
                    historicalIncentives: {
                        ...state.historicalIncentives,
                        loading: false,
                        data: (action as unknown as SetHistoricalIncentivesData).payload
                    }
                }

            default:
                return state;
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

const useAccount = () => {
    const { state } = useStoreContext();
    return state.account;
}

const useContributions = () => {
    const account = useAccount();
    return account.data.contributions;
}

const useHistoricalIncentives = () => {
    const { state } = useStoreContext();
    return state.historicalIncentives;
}

export {
    StoreProvider,
    ActionType,

    useStoreContext,

    useChronicle,
    useOwn,
    useSibling,
    useAccount,
    useContributions,
    useHistoricalIncentives
}