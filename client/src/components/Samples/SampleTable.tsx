import { DataGrid, GridColDef, GridRowId, GridToolbar, GridValueGetterParams } from '@mui/x-data-grid';
import { GridToolbarContainer } from '@mui/x-data-grid/components';

import { Alert, AlertProps, Button, MenuItem, Paper, Select, SelectChangeEvent, Snackbar, Typography } from "@mui/material";

import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import HistoryIcon from '@mui/icons-material/History';

import { AxiosResponse } from "axios";

import { useEffect, useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import * as api from '../../api/index';
import { GeneralSample, Printer } from "../../api/types";

import { Link } from "react-router-dom";

import "./styles.css";

interface SampleTableProps {
    /**
     * What key to select from the redux state
     * * useSelector((state) => state[selector])
     * 
     */
    selector: string;
    
    /**
     * What should happen when the refresh button is clicked
     * * This is usually a dispatch to the redux store
     */
    onRefresh?: () => void;

    /**
     * What should happen when the delete button is clicked
     * * Generally going to call an api route to delete each sample
     */
    onDelete?: (selected: GeneralSample[]) => Promise<void>;

    /**
     * Given an array of selected samples, generate the labels, 
     * and return an array of base64 strings
     * @param selected The current samples selected in the data grid
     * @returns An array of base64 strings
     */
    onGenerateLabels?: <T extends GeneralSample>(selected: T[]) => Promise<string[]>;

    /**
     * Function encapsulating an api call to the server to update a sample
     * @param sample The sample to be updated
     * @returns The updated sample with its new qr_code_key as an axios response
     */
    updateSample?: <T extends GeneralSample>(sample: T) => Promise<AxiosResponse<T, any>>

    /**
     * Overrides selected samples from redux store.
     * Most likely use case is with an audit table.
     */
    overrideSamples?: GeneralSample[];

    /**
     * Whether we are showing an audit table or not. An audit table will have certain 
     * features removed such as editing, generating labels, and deleting samples.
     */
    isAuditTable?: boolean;

    /**
     * A function, that given an audit id, returns a link to the audit page for that sample
     * @param audit_id The audit id of the sample we wish to audit
     * @returns 
     */
    auditLink?: (audit_id: string) => string;

    /**
     * Any additional column defintions we will need to visualize the data properly
     * 4 columns are added by default (qr_code_key, date_entered, date_modified, expiration_date)
     */
    gridColDefs?: GridColDef[];
}

const SampleTable: React.FC<SampleTableProps> = ({
    selector,
    onRefresh,
    onGenerateLabels,
    onDelete,
    updateSample,
    overrideSamples,
    isAuditTable,
    auditLink,
    gridColDefs: overrideGridColDefs,
}) => {
    /**
     * Stores the base64 label images generated by `onGenerateLabels`
     */
    const [labelImages, setLabelImages] = useState<string[]>([]);

    // /**
    //  * This stores the most recent samples filtered by audit_id and audit_number.
    //  * This only shows unique sample (i.e. unique audit_id). These are the samples
    //  * that are shown in the data grid.
    //  */
    // const [viewableSamples, setViewableSamples] = useState<GeneralSample[]>([]);

    /**
     * Stores the currently selected samples. These are the samples that are passed to 
     * the `onGenerateLabels` function.
     */
    const [selectedSamples, setSelectedSamples] = useState<GeneralSample[]>([]);    

    /**
     * The currently selected printer name. We can search the printers returned by
     * the redux store to find the full printer details (ip, name, model, location)
     */
    const [printer, setPrinter] = useState('None');

    /**
     * The current page size. This is used to determine how many samples to show on each page
     */
    const [pageSize, setPageSize] = useState(10);

    const [showPrintStatusAlert, setShowPrintStatusAlert] = useState(false);

    const [printStatusSeverity, setPrintStatusSeverity] = useState<AlertProps['severity']>('success');

    const [printStatusMessage, setPrintStatusMessage] = useState("");

    const labelImageContainerRef = useRef<HTMLDivElement>(null);

    /**
     * If we are given `overrideSamples` use those, 
     * otherwise, select our samples from the redux store.
     * * We must call useSelector initially due to reacts rule of hooks
     */
    var samples: GeneralSample[] = useSelector((state: any) => state[selector]);

    if (overrideSamples !== undefined) {
        samples = overrideSamples;
    }
    
    /**
     * Now we will select all the printers from the redux store.
     */
    const printers: Printer[] = useSelector((state: any) => state.printers);

    /** ----- on functions ----- */

    /**
     * Handles the printing of the labels.
     */
    const onPrintLabels = async () => {
        const device: Printer = printers.find((p: Printer) => p.name === printer)!;

        const { data } =  await api.printLabels(labelImages, device);
        if (data.success) {
            setShowPrintStatusAlert(true);
            setPrintStatusSeverity('success');
            setPrintStatusMessage('Labels printed successfully');
        } else {
            setShowPrintStatusAlert(true);
            setPrintStatusSeverity('error');
            setPrintStatusMessage('Labels failed to print (printer took too long to respond)');
        }
        setLabelImages([]); // clear the label images
    }

    /**
     * When a printer is selected from the dropdown, this function will be called.
     * The dropdown is only visible after labels have been generated.
     * @param event The event that triggered this function
     */
    const onPrinterChange = (event: SelectChangeEvent<string>) => {
        setPrinter(event.target.value);
    }

    /**
     * Handles the editing process and makes the relevant api call to update the sample.
     * Due to the async nature of this function and the fact that we make a call to the api the following happens:
     * 1. We tell the api that we are updating the sample
     * 2. We tell the redux store to refresh aka get all samples again
     * 3. We return whatever the contents of the row are that the user sees (without the new qr code key)
     * 4. The api call from part 1 goes through and updates the database
     * 5. The redux store refreshes and the user sees the updated sample
     * * This results in the user seeing the new row, with the old qr code key, for a split second. Then once the api call goes through the user sees the updated row with the new qr code key.
     * * Essentially the old row is deleted and a new row is created with the same data. The only difference is the qr code key.
     * * A possible fix could be to generate the new qr_code_key on the frontend. 
     * @param newRow The new row data
     * @param oldRow The old row data
     * @returns The data to display in the data grid
     */
    const onSampleRowEdit = async (newRow: GeneralSample, oldRow: GeneralSample): Promise<GeneralSample> => {
        const prismaDate = (dstring: string) => new Date(dstring).toISOString().split('T')[0];

        const row = {
            ...newRow,
            date_entered: prismaDate(newRow.date_entered),
            date_modified: prismaDate(new Date(Date.now()).toString()),
            expiration_date: prismaDate(newRow.expiration_date),
        }

        const { data } = await updateSample!(row);

        onRefresh?.();

        return data;
    }

    /**
     * Fired when a new sample (or all) was selected in data grid
     * @param newSelection The new selection of samples
     */
    const onSelectionChange = (newSelection: GridRowId[]) => {
        const selectedSamples: GeneralSample[] = []
        newSelection.forEach((qr_code_key: GridRowId) => {
            selectedSamples.push(samples.find((sample: GeneralSample) => sample.qr_code_key === qr_code_key)!);
        });
        setSelectedSamples(selectedSamples);
    }

    /** ---------- end --------- */

    /**
     * Custom toolbar for the data grid to add a few buttons
     */
    const CustomToolbar: React.FC = () => {
        const onGenerateLabelsClick = async () => {
            setLabelImages(await onGenerateLabels!(selectedSamples));
            // dont work :(
            labelImageContainerRef.current?.scrollIntoView({ behavior: 'smooth' })
        }

        return (
            <GridToolbarContainer>
                <GridToolbar />
                
                <Button 
                    startIcon={<NoteAddIcon />} 
                    disabled={selectedSamples.length == 0} 
                    onClick={onGenerateLabelsClick}
                >
                    Generate Label(s)
                </Button>

                <Button 
                    startIcon={<DeleteIcon />} 
                    disabled={selectedSamples.length == 0} 
                    onClick={() => { onDelete!(selectedSamples); }}
                >
                    Delete Sample(s)
                </Button>
                
                <Button 
                    startIcon={<HistoryIcon />} 
                    disabled={selectedSamples.length != 1}
                >
                    <Link
                        to={auditLink!(selectedSamples[0]?.audit_id)}
                        style={{textDecoration: 'none', color: 'inherit'}}
                    >
                        View Audit Table    
                    </Link>
                </Button>

                <Button 
                    startIcon={<RefreshIcon />} 
                    onClick={onRefresh}
                >
                    Refresh Samples
                </Button>
            </GridToolbarContainer>
        )
    }

    const dateGetter = <K extends keyof GeneralSample>(sample: GeneralSample, key: K) => {
        const input: string = sample[key] as string;
        const split = input.split("-");
        const year = split[0];
        const month = split[1];
        const day = split[2];
        const date = `${month}/${day}/${year}`;
        // some dates had some sort of sequence like {month}/{day}T00:00:00Z/{year}
        // so we remove that
        var out: string = date.substring(0, date.indexOf('T')) + date.substring(date.indexOf('Z'), date.length);       
        return new Date(out);
    } 

    const columns: GridColDef[] = [
        { 
            field: 'qr_code_key', 
            headerName: 'QR Code Key', 
            width: 150,
            sortable: false,
        },
        ...(overrideGridColDefs ?? []),
        { 
            field: 'date_entered', 
            headerName: 'Date Entered', 
            flex: 0.6,
            type: 'date',
            sortable: true,
            editable: true,
            valueGetter: (params: GridValueGetterParams<any, GeneralSample>) => dateGetter(params.row, 'date_entered')
        },
        { 
            field: 'date_modified', 
            headerName: 'Date Modified', 
            type: 'date',
            flex: 0.6,
            sortable: true,
            editable: false,
            valueGetter: (params: GridValueGetterParams<any, GeneralSample>) => dateGetter(params.row, 'date_modified')
        },
        { 
            field: 'expiration_date', 
            headerName: 'Expiration Date',
            flex: 0.6,
            type: 'date',
            sortable: true,
            editable: true,
            valueGetter: (params: GridValueGetterParams<any, GeneralSample>) => dateGetter(params.row, 'expiration_date')
        },
    ];

    return (
        <>
        <Snackbar 
                open={showPrintStatusAlert} 
                autoHideDuration={3000} 
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                onClose={() => setShowPrintStatusAlert(false)}
            >
                <Alert 
                    severity={printStatusSeverity}
                    color={printStatusSeverity}
                    onClose={() => setShowPrintStatusAlert(false)}
                >
                    {printStatusMessage}
                </Alert>
        </Snackbar>
        <div className='data-grid-container'>
            <DataGrid className='data-grid'
                experimentalFeatures={{ newEditingApi: true }}
                rows={samples}
                columns={columns}
                pageSize={pageSize}
                rowsPerPageOptions={[10, 25, 50]}
                getRowId={(sample: GeneralSample) => sample.qr_code_key}
                components={{ Toolbar: isAuditTable ? GridToolbar : CustomToolbar }}
                isCellEditable={(params) => params.field !== 'qr_code_key' && params.field != 'date_entered' && !isAuditTable}
                disableSelectionOnClick
                checkboxSelection
                onSelectionModelChange={onSelectionChange}
                onPageSizeChange={(size) => setPageSize(size)}
                editMode='row'
                processRowUpdate={onSampleRowEdit}
                getRowClassName={(params) => {
                    return `${new Date(params.row.expiration_date) < new Date(Date.now()) && !isAuditTable ? 'data-grid-row-expired' : ''}`;
                }}
            />
        </div>
        
        {
            labelImages.length > 0 ? (
                <>
                    <Paper className="img-label-container">
                        {
                            labelImages.map((labelImage: string, i) =>
                                <img width={270} height={90} className="img-label" key={`${i}`} src={`data:image/png;base64,${labelImage}`} alt="Label"/>
                            )
                        }
                    </Paper>
                    <Paper className="printer-selector-container">
                        <div style={{ display: 'flex', alignItems: 'center', marginRight: '5px' }}>
                            <Typography variant="h6">Select printer:</Typography>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Select
                                value={printer}
                                label="Printer"
                                variant="standard"
                                onChange={onPrinterChange}
                            >
                                <MenuItem value='None'>None</MenuItem>
                                {
                                    printers.map((printer: Printer, i) =>
                                        <MenuItem key={`${i}`} value={printer.name}>{printer.name}</MenuItem>
                                    )
                                }
                            </Select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '5px' }}>
                            {
                                printer !== 'None' ? (
                                    <Button onClick={onPrintLabels} >Print Labels</Button>
                                ) : (
                                    <></>
                                )
                            }
                        </div>
                    </Paper>
                </>
            ) : (
                <></>
            )
        }

        <div ref={labelImageContainerRef}></div>
        </>
    );
}

export default SampleTable;