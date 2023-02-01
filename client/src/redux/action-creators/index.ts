import { Dispatch } from "redux";
import { SampleAction, TeamAction } from "../actions";
import { SampleActionType, TeamActionType } from "../action-types";

import * as api from "../../api";

export const fetchTeamsSamples = (team: string) => {
    return async (dispatch: Dispatch<SampleAction>) => {
        const samples = await api.getTeamSamples(team);

        dispatch({
            type: SampleActionType.FETCH_TEAM,
            payload: {
                team,
                samples
            }
        });
    }
}

export const fetchAllSamples = () => {
    return async (dispatch: Dispatch<SampleAction>) => {
        const data = await api.getAllSamples();

        dispatch({
            type: SampleActionType.FETCH_ALL,
            payload: data
        });
    } 
}

export const createSample = (team: string, sample: api.CreateSampleRequirements) => {
    return async (dispatch: Dispatch<SampleAction>) => {
        const data = await api.createSample(sample);

        dispatch({
            type: SampleActionType.CREATE,
            payload: {
                team,
                sample: data
            }
        });
    }
}

export const updateSample = (id: string, sample: api.UpdateSampleRequirements) => {
    return async (dispatch: Dispatch<SampleAction>) => {
        const data = await api.updateSample(id, sample);
        fetchAllSamples()(dispatch);
    }
}

export const deleteSample = (id: string) => {
    return async (dispatch: Dispatch<SampleAction>) => {
        const data = await api.deleteSample(id);
        fetchAllSamples()(dispatch);
    }
}

export const setTeam = (team: string) => {
    return (dispatch: Dispatch<TeamAction>) => {
        dispatch({
            type: TeamActionType.SET_TEAM,
            payload: team
        });
    }
}