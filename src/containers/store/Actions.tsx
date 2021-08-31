import { Account, Chronicle, HistoricalIncentive, HistoricalParachainFundsPledged, Incentives, ParachainFundsPledged } from "./../../hooks/useQueries"

export enum ActionType {

    LoadInitialData = 'LOAD_INITIAL_DATA',
    SetInitialData = 'SET_INITIAL_DATA_SUCCESS',

    LoadChronicleData = 'LOAD_CHRONICLE_DATA',
    SetChronicleData = 'SET_CHRONICLE_DATA',

    LoadAccountData = 'LOAD_ACCOUNT_DATA',
    SetAccountData = 'SET_ACCOUNT_DATA',

    LoadIncentiveData = 'LOAD_INCENTIVE_DATA',
    SetIncentiveData = 'SET_INCENTIVE_DATA'
}

export type LoadInitialData = {
    type: ActionType.LoadInitialData
}

export type SetInitialData = {
    type: ActionType.SetInitialData
    payload: {
        chronicle: Chronicle,
        ownHistoricalFundsPledged: HistoricalParachainFundsPledged[],
        ownParachainFundsPledged: ParachainFundsPledged,
        incentives: Incentives
    }
}

export type LoadChronicleData = {
    type: ActionType.LoadChronicleData,
}

export type SetChronicleData = {
    type: ActionType.SetChronicleData,
    payload: Chronicle
}

export type LoadAccountData = {
    type: ActionType.LoadAccountData
}

export type SetAccountData = {
    type: ActionType.SetAccountData,
    payload: Account & {
        historicalIncentives: HistoricalIncentive[]
    }
}

export type LoadIncentiveData = {
    type: ActionType.LoadIncentiveData
}

export type SetIncentiveData = {
    type: ActionType.SetIncentiveData,
    payload: Incentives
}

export type Action = 
    | LoadInitialData
    | SetInitialData
    | LoadChronicleData
    | SetChronicleData
    | LoadAccountData
    | SetAccountData
    | LoadIncentiveData
    | SetIncentiveData