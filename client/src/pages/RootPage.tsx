import NavBar from "../components/NavBar/NavBar";
import { useDispatch, useSelector } from "react-redux";
import { State, actionCreators } from "../redux";
import { useEffect, useState } from "react";

import * as api from "../api";
import { bindActionCreators } from "redux";
import { MenuItem, Select } from "@mui/material";

const RootPage = () => {

    const state = useSelector((state: State) => state);
    const dispatch = useDispatch();

    const [teams, setTeams] = useState<api.Team[]>([]);

    const { setTeam, fetchAllSamples } = bindActionCreators(actionCreators, dispatch);
    
    useEffect(() => {
        fetchAllSamples();
        api.getAllTeams().then((res) => {
            setTeams(res);
            setTeam(res[0].name ?? "");
        });
    }, []);

    useEffect(() => {
        console.log(state);
    }, [state]);

    return (
        <> 
            <NavBar />
            <Select
                value={state.team}
                onChange={(event) => setTeam(event.target.value)}
            >
                {
                    teams.map((team, _) => 
                        <MenuItem
                            key={_}
                            value={team.name}
                        >
                            {team.name}
                        </MenuItem>
                    )
                }
            </Select>
            <div>
                {
                    state.samples.hasOwnProperty(state.team) ?
                    state.samples[state.team].map((sample, _) => 
                        <div key={_}>
                            {JSON.stringify(sample, null, 2)}
                        </div>
                    )
                    : <></>
                }
            </div>
        </>
    )

}

export default RootPage;