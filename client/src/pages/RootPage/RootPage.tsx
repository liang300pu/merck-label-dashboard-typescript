import NavBar from "../../components/NavBar/NavBar";

import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, State } from "../../redux-new";
import { useEffect } from "react";

const RootPage = () => {

    const dispatch = useDispatch();

    const { fetchAllSamples } = bindActionCreators(actionCreators, dispatch);

    useEffect(() => {
        fetchAllSamples();
    }, []);

    return (
        <>
            <NavBar />
        </>
    );
    
} 

export default RootPage