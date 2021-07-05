import { AccountState, HistoricalIncentives, ParachainCrowdloanState } from "./Store";
import { Chronicle } from './../../hooks/useQueries';

export enum ActionType {
    LoadChronicle = 'LOAD_CHRONICLE',
    SetChronicle = 'SET_CHRONICLE',

    LoadOwnData = 'LOAD_OWN_DATA',
    SetOwnData = 'SET_OWN_DATA',

    LoadSiblingData = 'LOAD_SIBLING_DATA',
    SetSiblingData = 'SET_SIBLING_DATA',

    ConnectAccount = 'CONNECT_ACCOUNT',
    SetAccountData = 'SET_ACCOUNT_DATA',

    LoadHistoricalIncentivesData = 'LOAD_HISTORICAL_INCENTIVES_DATA',
    SetHistoricalIncentivesData = 'SET_HISTORICAL_INCENTIVES_DATA'
};

export type ActionWithoutPayload = {
    type: ActionType
    payload?: null
};

export type SetChronicle = {
    type: ActionType.SetChronicle,
    payload: Chronicle
}

export type SetOwnData = {
    type: ActionType.SetOwnData,
    payload: ParachainCrowdloanState
}

export type SetSiblingData = {
    type: ActionType.SetSiblingData,
    payload: ParachainCrowdloanState
}

export type SetAccountData = {
    type: ActionType.SetAccountData,
    payload: AccountState
}

export type SetHistoricalIncentivesData = {
    type: ActionType.SetHistoricalIncentivesData,
    payload: HistoricalIncentives
}


export type Action = 
    | ActionWithoutPayload
    | SetChronicle
    | SetOwnData
    | SetSiblingData
    | SetAccountData
    | SetHistoricalIncentivesData