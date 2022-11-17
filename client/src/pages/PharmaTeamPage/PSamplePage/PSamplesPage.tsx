import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { getSamples } from '../../../redux/actions/samples';
import { getPrinters } from '../../../redux/actions/printer';

import NavBar from "../../../components/NavBar/NavBar"

// import useStyles from './styles'
import { Container, Grow, Grid } from '@mui/material';
import Samples from "../../../components/Samples/PSamples";

const PSamplesPage = () => {

    // const classes = useStyles();
    const dispatch = useDispatch();

    useEffect(() => {
        // @ts-ignore
        dispatch(getSamples());
        // @ts-ignore
        dispatch(getPrinters())
    }, [dispatch])

    return (
        <NavBar>
            <Samples />
        </NavBar>
    )
}

export default PSamplesPage