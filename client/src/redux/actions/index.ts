import { PrinterActionType, SampleActionType, TeamActionType } from "../action-types";
import { Sample, Printer } from "../../api/types";

export interface PrinterFetchAllAction {
    type: PrinterActionType.FETCH_ALL;
    payload: Printer[];
}

export interface PrinterCreateAction {
    type: PrinterActionType.CREATE;
    payload: Printer;
}

export type PrinterAction = PrinterFetchAllAction | PrinterCreateAction;

export interface FetchTeamsSamplesAction {
    type: SampleActionType.FETCH_TEAM;
    payload: {
        team: string;
        samples: Sample[];
    };
}

export interface FetchAllSamplesAction {
    type: SampleActionType.FETCH_ALL,
    payload: {
        [key: string]: Sample[]
    }
}

export interface SampleCreateAction {
    type: SampleActionType.CREATE;
    payload: {
        team: string;
        sample: Sample;
    };
}

export type SampleAction = FetchTeamsSamplesAction | FetchAllSamplesAction | SampleCreateAction;

export interface SetTeamAction {
    type: TeamActionType.SET_TEAM;
    payload: string;
}

export type TeamAction = SetTeamAction;