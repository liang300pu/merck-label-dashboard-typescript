import React, { useState } from 'react';

import useStyles from './styles'

import * as api from '../../api/index';

import { useSelector } from 'react-redux';
// import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { TableContainer, Table, Paper, TableHead, TableRow, TableCell, TableBody, IconButton, InputLabel, Select, MenuItem } from '@mui/material';
import { Edit, Print } from '@mui/icons-material';

const Samples = () => {
    const [labelImage, setLabelImage] = useState('');
    const samples = useSelector((state: any) => state.samples);
    const printers = useSelector((state: any) => { 
        console.log(state)
        return state.printers
    });
    const classes = useStyles();

    const handleGenerateLabel = async (event: any, sample: any) => {
        const { qr_code_image } = (await api.createLabel(sample)).data;
        setLabelImage(qr_code_image);
    }

    const handlePrintLabel = async (event: any, printer: any) => {
        await api.printLabel(labelImage, printer)
    }

    return (
        <>
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>QR Code Key</TableCell>
                        <TableCell>Experiment ID</TableCell>
                        <TableCell>Storage Condition</TableCell>
                        <TableCell>Contents</TableCell>
                        <TableCell>Analyst</TableCell>
                        <TableCell>Date Created</TableCell>
                        <TableCell>Date Modified</TableCell>
                        <TableCell>Expiration Date</TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        samples.map((sample: any) => (
                            <TableRow key={sample.qr_code_key} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell component="th" scope="row">{sample.qr_code_key}</TableCell>
                                <TableCell align="right">{sample.experiment_id}</TableCell>
                                <TableCell align="right">{sample.storage_condition}</TableCell>
                                <TableCell align="right">{sample.contents}</TableCell>
                                <TableCell align="right">{sample.analyst}</TableCell>
                                <TableCell align="right">{sample.date_entered}</TableCell>
                                <TableCell align="right">{sample.date_modified}</TableCell>
                                <TableCell align="right">{sample.expiration_date}</TableCell>
                                <TableCell> <IconButton> <Edit /> </IconButton> </TableCell>
                                <TableCell> <IconButton onClick={(event) => handleGenerateLabel(event, sample)}> <Print /> </IconButton> </TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>    
        </TableContainer>
        
        <Paper style={{
            width: '100%',
            margin: 'auto'
        }}>
            {
                labelImage !== '' ? 
                <div>
                    <img src={`data:image/png;base64,${labelImage}`} alt="Label" style={{ objectFit: 'cover' }} /> 
                    <InputLabel id="printer-label">Printer</InputLabel>
                    <Select>
                        {

                        }
                    </Select>
                </div>
                
                : null
            }
        </Paper>
     
    
        </>
    )
}

export default Samples;