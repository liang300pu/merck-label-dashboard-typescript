import { Alert, Button, Paper, Snackbar, TextField, Typography } from "@mui/material";
import { GeneralSample, Printer } from "../../api/types";
import React, { useState } from "react";
import * as api from "../../api/index";

import "./styles.css";
import { useDispatch } from "react-redux";
import { getPrinters } from "../../redux/actions/printer";


const CreatePrinterForm: React.FC = () => {

    const emptyPrinter = {
        ip: "",
        name: "",
        location: "",
        model: "Unknown"
    }

    const [printer, setPrinter] = useState<Printer>(emptyPrinter);
    const [allFieldsFilled, setAllFieldsFilled] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    const dispatch = useDispatch();

    const onChange = (event: any, field: string) => {
        const updated = { ...printer, [field]: event.target.value };

        var allFilled = true;
        for (const key of Object.keys(printer)) {
            if (updated[key] === "") {
                allFilled = false;
                break;
            }
        }

        setAllFieldsFilled(allFilled);
        setPrinter(previous => ({ ...previous, [field]: event.target.value }));
    }

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        setAllFieldsFilled(false);
        setPrinter(emptyPrinter);
        setShowSuccessAlert(true);
        await api.createPrinter(printer);
        // @ts-ignore
        dispatch(getPrinters());
    }

    return (
        <>
            <Snackbar 
                open={showSuccessAlert} 
                autoHideDuration={3000} 
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                onClose={() => setShowSuccessAlert(false)}
            >
                <Alert 
                    severity="success"
                    onClose={() => setShowSuccessAlert(false)}
                >
                    Printer successfully created
                </Alert>
            </Snackbar>
            <Paper className="sample-form-paper" style={{ margin: '0px' }}>
                <form className="sample-form" onSubmit={handleSubmit} autoComplete="off">
                    <Typography className="sample-form-header-text" variant="h6" color="primary">
                        Enter Printer Information
                    </Typography>
                    <TextField
                        className="sample-form-textfield"
                        key={"ip"}
                        margin='normal'
                        size='small'
                        name={"ip"}
                        variant="outlined"
                        type={"text"}
                        label={"IP"}
                        value={printer["ip"]}
                        fullWidth
                        onChange={(event) => onChange(event, "ip")}
                    />
                    <TextField
                        className="sample-form-textfield"
                        key={"name"}
                        margin='normal'
                        size='small'
                        name={"name"}
                        variant="outlined"
                        type={"text"}
                        label={"Name"}
                        value={printer["name"]}
                        fullWidth
                        onChange={(event) => onChange(event, "name")}
                    />
                    <TextField
                        className="sample-form-textfield"
                        key={"location"}
                        margin='normal'
                        size='small'
                        name={"location"}
                        variant="outlined"
                        type={"text"}
                        label={"Location"}
                        value={printer["location"]}
                        fullWidth
                        onChange={(event) => onChange(event, "location")}
                    />
                    <TextField
                        className="sample-form-textfield"
                        key={"model"}
                        margin='normal'
                        size='small'
                        name={"model"}
                        variant="outlined"
                        type={"text"}
                        label={"Model"}
                        value={printer["model"]}
                        fullWidth
                        onChange={(event) => onChange(event, "model")}
                    />
                    <Button
                        className="sample-form-submit-button"
                        variant='contained'
                        type='submit'
                        color='primary'
                        size='large'
                        disabled={!allFieldsFilled}
                        fullWidth
                    >
                        Submit
                    </Button>
                </form>
            </Paper>
        </>
    );

}

export default CreatePrinterForm;