import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { TextField, Button, Typography, Paper } from '@mui/material';

import useStyles from './styles'
import { createSample } from '../../redux/actions/samples';

import * as api from '../../api/index';

const Form = () => {
    const classes = useStyles();
    const dispatch = useDispatch();

    const [sampleData, setSampleData] = useState({
        sample_id: '',
        experiment_id: '',
        storage_condition: '',
        contents: '',
        analyst: '',
        date_entered: (new Date(Date.now())).toISOString().split('T')[0],
        expiration_date: (new Date(Date.now())).toISOString().split('T')[0],
        date_modified: (new Date(Date.now())).toISOString().split('T')[0],
    });

    // Generate a QR Code here
    const handleSubmit = async (event: any) => {
        event.preventDefault()
        let { qr_code_key } = (await api.createQRCodeKey(sampleData)).data;

        // @ts-ignore
        dispatch(createSample({...sampleData, qr_code_key}))
    }

    return (
        <Paper className={classes.paper}>
            <form autoComplete='off' noValidate className={classes.form} onSubmit={handleSubmit}>
                <Typography  variant='h6'>Sample Information</Typography>
                <TextField 
                    margin='normal'
                    name="sampleID" 
                    variant="outlined" 
                    label="Sample ID" 
                    fullWidth 
                    value={sampleData.sample_id} 
                    onChange={(event) => setSampleData({ ...sampleData, sample_id: event.target.value })}
                />
                <TextField 
                    margin='normal'
                    name="experimentID" 
                    variant="outlined" 
                    label="Experiment ID" 
                    fullWidth 
                    value={sampleData.experiment_id} 
                    onChange={(event) => setSampleData({ ...sampleData, experiment_id: event.target.value })}
                />

                <TextField 
                    margin='normal'
                    name="storageCondition" 
                    variant="outlined" 
                    label="Storage Condition" 
                    fullWidth 
                    value={sampleData.storage_condition} 
                    onChange={(event) => setSampleData({ ...sampleData, storage_condition: event.target.value })}
                />

                <TextField 
                    margin='normal'
                    name="contents" 
                    variant="outlined" 
                    label="Contents" 
                    fullWidth 
                    value={sampleData.contents} 
                    onChange={(event) => setSampleData({ ...sampleData, contents: event.target.value })}
                />

                <TextField 
                    margin='normal'
                    name="analyst" 
                    variant="outlined" 
                    label="Analyst" 
                    fullWidth 
                    value={sampleData.analyst} 
                    onChange={(event) => setSampleData({ ...sampleData, analyst: event.target.value })}
                />

                <TextField 
                    margin='normal'
                    name="dateEntered" 
                    variant="outlined" 
                    label="Date Entered" 
                    type='date'
                    fullWidth 
                    value={sampleData.date_entered} 
                    // defaultValue={(new Date(Date.now())).toISOString()}
                    onChange={(event) => setSampleData({ ...sampleData, date_entered: event.target.value })}
                />

                <TextField 
                    margin='normal'
                    name="expirationDate" 
                    variant="outlined" 
                    label="Expiration Date" 
                    type='date'
                    fullWidth 
                    value={sampleData.expiration_date} 
                    // defaultValue={(new Date(Date.now())).toISOString()}
                    onChange={(event) => setSampleData({ ...sampleData, expiration_date: event.target.value })}
                />

                <TextField 
                    margin='normal'
                    name="dateModified" 
                    variant="outlined" 
                    label="Date Appended" 
                    type='date'
                    fullWidth 
                    value={sampleData.date_modified}
                    // defaultValue={(new Date(Date.now())).toISOString()} 
                    onChange={(event) => setSampleData({ ...sampleData, date_modified: event.target.value })}
                />

                <Button
                    className={classes.buttonSubmit}
                    variant='contained'
                    color='primary'
                    size='large'
                    type='submit'
                    fullWidth
                >
                    Submit
                </Button>
            </form>
        </Paper>
    )
}

export default Form;
