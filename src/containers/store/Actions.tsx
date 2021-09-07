import { Account, Chronicle, HistoricalIncentive, HistoricalParachainFundsPledged, Incentives, ParachainDetails } from "./../../hooks/useQueries"

export enum ActionType {

    LoadInitialData = 'LOAD_INITIAL_DATA',
    SetInitialData = 'SET_INITIAL_DATA_SUCCESS',

    LoadChronicleData = 'LOAD_CHRONICLE_DATA',
    SetChronicleData = 'SET_CHRONICLE_DATA',

    LoadAccountData = 'LOAD_ACCOUNT_DATA',
    SetAccountData = 'SET_ACCOUNT_DATA',

    LoadIncentiveData = 'LOAD_INCENTIVE_DATA',
    SetIncentiveData = 'SET_INCENTIVE_DATA',

    LoadHistoricalSiblingFundsPledgedData = 'LOAD_HISTORICAL_SIBLING_FUNDS_PLEDGED_DATA',
    SetHistoricalSiblingFundsPledgedData = 'SET_HISTORICAL_SIBLING_FUNDS_PLEDGED_DATA',

    LoadLatestOwnFundsPledgedData = 'LOAD_LATEST_OWN_FUNDS_PLEDGED_DATA',
    SetLatestOwnFundsPledgedData = 'SET_LATEST_OWN_FUNDS_PLEDGED_DATA',

    LoadLatestSiblingFundsPledgedData = 'LOAD_LATEST_SIBLING_FUNDS_PLEDGED_DATA',
    SetLatestSiblingFundsPledgedData = 'SET_LATEST_SIBLING_FUNDS_PLEDGED_DATA'
}

export type LoadInitialData = {
    type: ActionType.LoadInitialData
}

export type SetInitialData = {
    type: ActionType.SetInitialData
    payload: {
        chronicle: Chronicle,
        ownHistoricalFundsPledged: HistoricalParachainFundsPledged[],
        ownParachain: ParachainDetails,
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

export type LoadHistoricalSiblingData = {
    type: ActionType.LoadHistoricalSiblingFundsPledgedData
}

export type SetHistoricalSiblingData = {
    type: ActionType.SetHistoricalSiblingFundsPledgedData,
    payload: HistoricalParachainFundsPledged[]
}

export type LoadLatestSiblingFundsPledgedData = {
    type: ActionType.LoadLatestSiblingFundsPledgedData
}

export type SetLatestSiblingFundsPledgedData = {
    type: ActionType.SetLatestSiblingFundsPledgedData,
    payload: ParachainDetails
}

export type LoadLatestOwnFundsPledgedData = {
    type: ActionType.LoadLatestOwnFundsPledgedData
}

export type SetLatestOwnFundsPledgedData = {
    type: ActionType.SetLatestOwnFundsPledgedData,
    payload: ParachainDetails
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
    | LoadHistoricalSiblingData
    | SetHistoricalSiblingData
    | LoadLatestSiblingFundsPledgedData
    | SetLatestSiblingFundsPledgedData
    | LoadLatestOwnFundsPledgedData
    | SetLatestOwnFundsPledgedData