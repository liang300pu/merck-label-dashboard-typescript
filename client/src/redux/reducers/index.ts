import { combineReducers } from "redux";

/**
 * TODO:
 * 1. Create a reducer for storing all the teams
 * 2. Create a reducer for storing all the teams fields
 * 3. Create a reducer for storing all the teams labels
 * 4. Finish reducer for printers
 */

import samplesReducer from "./sampleReducer";
import teamReducer from "./teamReducer";

const reducers = combineReducers({
    samples: samplesReducer,
    team: teamReducer
});

export default reducers;

export type State = ReturnType<typeof reducers>;