import { combineReducers } from "redux";

import samplesReducer from "./sampleReducer";

const reducers =  combineReducers({
    samples: samplesReducer
});

export default reducers;

export type State = ReturnType<typeof reducers>;