import { ParachainCrowdloanState } from "./Store";
import { Chronicle } from './../../hooks/useQueries';

export enum ActionType {
    LoadChronicle = 'LOAD_CHRONICLE',
    SetChronicle = 'SET_CHRONICLE',

    LoadOwnData = 'LOAD_OWN_DATA',
    SetOwnData = 'SET_OWN_DATA',

    LoadSiblingData = 'LOAD_SIBLING_DATA',
    SetSiblingData = 'SET_SIBLING_DATA'
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

export type Action = 
    | ActionWithoutPayload
    | SetChronicle
    | SetOwnData
    | SetSiblingData