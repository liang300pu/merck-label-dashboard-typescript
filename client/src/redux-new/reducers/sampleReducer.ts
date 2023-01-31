import { SampleAction } from "../actions";
import { SampleActionType } from "../action-types";
import { Sample } from "../../api/types";

const reducer = (state: { [key: string]: Sample[] } = {}, action: SampleAction) => {

    switch (action.type) {
        case SampleActionType.FETCH_ALL:
            return action.payload;
        case SampleActionType.FETCH_TEAM:
            return {
                ...state,
                [action.payload.team]: action.payload.samples
            }
        case SampleActionType.CREATE:
            return {
                ...state,
                [action.payload.team]: [...state.samples[action.payload.team], action.payload.sample]
            }
        default:
            return state;
    }

}

export default reducer;