import { Dispatch } from "redux";
import { SampleAction } from "../actions";
import { SampleActionType } from "../action-types";
import axios from "axios";

export const fetchTeamsSamples = (team: string) => {
    return async (dispatch: Dispatch<SampleAction>) => {
        const { data } = await axios.get(`http://localhost:5000/${team}/samples/`);

        dispatch({
            type: SampleActionType.FETCH_TEAM,
            payload: {
                team,
                samples: data
            }
        });
    }
}

export const fetchAllSamples = () => {
    return async (dispatch: Dispatch<SampleAction>) => {
        const { data } = await axios.get(`http://localhost:5000/samples/`);

        dispatch({
            type: SampleActionType.FETCH_ALL,
            payload: data
        });
    } 
}

export const createSample = (team: string, sample: { data?: { [key: string]: any } }) => async (dispatch: Dispatch) => {
    const { data } = await axios.post(`http://localhost:5000/${team}/samples/`, sample);

    return (dispatch: Dispatch<SampleAction>) => {
        dispatch({
            type: SampleActionType.CREATE,
            payload: {
                team,
                sample: data
            }
        });
    }
}