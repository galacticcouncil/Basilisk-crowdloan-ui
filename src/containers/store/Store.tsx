import constate from 'constate';
import { initial } from 'lodash';
import { useReducer } from 'react';
import { Account, Chronicle, HistoricalIncentive, HistoricalParachainFundsPledged, Incentives, ParachainDetails } from 'src/hooks/useQueries';
import { Action, ActionType } from './Actions';


export enum LoadingState { 
    Initial, 
    Loading,
    Loaded 
};

type Loadable<T> = {
    loading: LoadingState,
    data: T
}

type Initial = {
    initializedAtBlockHeight: string | undefined
}

type State = {
    initial: Loadable<Initial>
    chronicle: Loadable<Chronicle>,
    incentives: Loadable<Incentives>,
    // TODO: create a separate time instead of an intersection
    account: Loadable<Account & {
        historicalIncentives: HistoricalIncentive[]
    }>
    own: {
        historicalFundsPledged: Loadable<HistoricalParachainFundsPledged[]>,
        parachain: Loadable<ParachainDetails>
    },
    sibling: {
        historicalFundsPledged: Loadable<HistoricalParachainFundsPledged[]>,
        parachain: Loadable<ParachainDetails>
    }
};

const loadable = <T extends unknown>(data: T): Loadable<T> => ({
    loading: LoadingState.Initial,
    data
});

const loading = <T extends unknown>(data: T): Loadable<T> => ({
    loading: LoadingState.Loading,
    data
});

const loaded = <T extends unknown>(data: T): Loadable<T> => ({
    loading: LoadingState.Loaded,
    data
});

const initialState: State = {
    initial: loadable({
        initializedAtBlockHeight: undefined
    }),
    chronicle: loadable({
        lastProcessedBlock: "0",
        mostRecentAuctionStart: undefined,
        mostRecentAuctionClosingStart: undefined
    }),
    incentives: loadable({
        leadPercentageRate: '0',
        totalContributionWeight: '0',
        siblingParachain: {
            id: undefined
        }
    }),
    account: loadable({
        totalContributed: '0',
        contributions: [],
        historicalIncentives: []
    }),
    own: {
        historicalFundsPledged: loadable([]),
        parachain: loadable({
            fundsPledged: '0',
            hasWonAnAuction: false
        })
    },
    sibling: {
        historicalFundsPledged: loadable([]),
        parachain: loadable({
            fundsPledged: '0',
            hasWonAnAuction: false
        })
    },
};

const reducer = (state: State, action: Action) => {
    switch (action.type) {
        case ActionType.LoadInitialData:
            return {
                ...state,
                initial: loading(state.initial.data)
            }

        case ActionType.SetInitialData: {
            return {
                ...state,
                initial: loaded({
                    initializedAtBlockHeight: action.payload.chronicle.lastProcessedBlock
                }),
                chronicle: loaded(action.payload.chronicle),
                incentives: loaded(action.payload.incentives),
                own: {
                    historicalFundsPledged: loaded(action.payload.ownHistoricalFundsPledged),
                    parachain: loaded(action.payload.ownParachain)
                }
            }
        }

        case ActionType.LoadAccountData:
            return {
                ...state,
                account: loading(state.account.data)
            }

        case ActionType.SetAccountData:
            return {
                ...state,
                account: loaded(action.payload)
            }

        case ActionType.LoadChronicleData:
            return {
                ...state,
                chronicle: loading(state.chronicle.data)
            }

        case ActionType.SetChronicleData:
            return {
                ...state,
                chronicle: loaded(action.payload)
            }

        case ActionType.LoadIncentiveData:
            return {
                ...state,
                incentives: loading(state.incentives.data)
            }

        case ActionType.SetIncentiveData: 
            return {
                ...state,
                incentives: loaded(action.payload)
            }

        case ActionType.LoadHistoricalSiblingFundsPledgedData:
            return {
                ...state,
                sibling: {
                    ...state.sibling,
                    historicalFundsPledged: loading(state.sibling.historicalFundsPledged.data)
                }
            }

        case ActionType.SetHistoricalSiblingFundsPledgedData:
            return {
                ...state,
                sibling: {
                    ...state.sibling,
                    historicalFundsPledged: loaded(
                        action.payload
                    )
                }
            }

        case ActionType.LoadLatestSiblingFundsPledgedData:
            return {
                ...state,
                sibling: {
                    ...state.sibling,
                    parachain: loading(state.sibling.parachain.data)
                }
            }

        case ActionType.SetLatestSiblingFundsPledgedData:
            return {
                ...state,
                sibling: {
                    ...state.sibling,
                    parachain: loaded(action.payload)
                }
            }

        case ActionType.LoadLatestOwnFundsPledgedData:
            return {
                ...state,
                own: {
                    ...state.own,
                    parachain: loading(state.own.parachain.data)
                }
            }

        case ActionType.SetLatestOwnFundsPledgedData:
            return {
                ...state,
                own: {
                    ...state.own,
                    parachain: loaded(action.payload)
                }
            }
        
        default:
            return state
    }
};
export const useStore = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    return { state, dispatch };
}

export const [StoreProvider, useStoreContext] = constate(useStore);
export const useDispatch = () => {
    const { dispatch } = useStoreContext();
    return dispatch;
}

export const useState = () => {
    const { state } = useStoreContext();
    return state;
}

export const useIsInitialDataLoading = () => {
    const state = useState();
    return state.initial.loading === LoadingState.Loading;
}

export const useIsInitialDataLoaded = () => {
    const state = useState();
    return state.initial.loading === LoadingState.Loaded;
}

export const useInitializedAtBlockHeight = () => {
    const state = useState();
    return state.initial.data.initializedAtBlockHeight;
}

export const useChronicle = () => {
    const state = useState();
    return state.chronicle
}

export const useChronicleLastProcessedBlock = () => {
    const chronicle = useChronicle();
    return chronicle.data.lastProcessedBlock;
}

export const useIncentives = () => {
    const state = useState();
    return state.incentives;
}

export const useIncentivesTotalContributionWeight = () => {
    const incentives = useIncentives();
    return incentives.data.totalContributionWeight;
}

export const useIncentivesLeadPercentageRate = () => {
    const incentives = useIncentives();
    return incentives.data.leadPercentageRate;
}

export const useAccount = () => {
    const state = useState();
    return state.account;
}

export const useHistoricalIncentives = () => {
    const state = useState();
    return state.account.data.historicalIncentives;
}

export const useOwnFundsPledged = () => {
    const state = useState();
    return state.own.parachain.data?.fundsPledged || '222000000000000';
}

export const useOwnHasWonAnAuction = () => {
    const state = useState();
    return state.own.parachain.data?.hasWonAnAuction || false;
}

export const useSiblingParachainId = () => {
    const incentives = useIncentives();
    return incentives.data.siblingParachain.id;
}

export const useOwn = () => {
    const state = useState();
    return state.own;
}

export const useSibling = () => {
    const state = useState();
    return state.sibling;
}
