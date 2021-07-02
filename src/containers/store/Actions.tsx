import { Chronicle, ParachainCrowdloanState } from "./Store";

export enum ActionType {
    LoadChronicle = 'LOAD_CHRONICLE',
    SetChronicle = 'SET_CHRONICLE',

    LoadOwnData = 'LOAD_OWN_DATA',
    SetOwnData = 'SET_OWN_DATA'
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

export type Action = 
    | ActionWithoutPayload
    | SetChronicle
    | SetOwnData