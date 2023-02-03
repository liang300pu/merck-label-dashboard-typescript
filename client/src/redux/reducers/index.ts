import { combineReducers } from "redux";

import samples from './samples'
import psamples from './psamples'
import printers from './printers'

const rootReducer = combineReducers({ samples, printers, psamples });

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;