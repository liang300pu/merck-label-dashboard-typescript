import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

import { 
    DataGrid, 
    GridColDef, 
    GridRowId, 
    GridToolbar, 
    GridToolbarContainer 
} from "@mui/x-data-grid";
import { 
    Box,
    Button, 
    CircularProgress, 
    CircularProgressProps, 
    Dialog, 
    DialogActions, 
    DialogContent, 
    DialogTitle, 
    MenuItem, 
    Select, 
    Typography 
} from "@mui/material";
import { 
    Delete, 
    NoteAdd, 
    Refresh,
    History
} from "@mui/icons-material";

import { DateTime } from "luxon";

import { Link } from "react-router-dom";

import * as api from "../../api";
import { State, useActionCreators } from "../../redux";

import "./styles.css"

interface SamplesTableToolbarProps {
    selectedSamples: api.Sample[];
    onGenerateLabelsClick: () => void;
}

interface PrintLabelsPopupDialogProps {
    open: boolean;
    onClose: () => void;
    selectedSamples: api.Sample[];
}

// Copied from https://material-ui.com/components/progress/#circular-with-label
function CircularProgressWithLabel(
    props: CircularProgressProps & { value: number },
  ) {
    return (
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress variant="determinate" {...props} />
            <Box
            sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            >
                <Typography
                    variant="caption"
                    component="div"
                    color="text.secondary"
                >{`${Math.round(props.value)}%`}</Typography>
            </Box>
        </Box>
    );
}

const PrintLabelsPopupDialog: React.FC<PrintLabelsPopupDialogProps> = ({
    open,
    onClose,
    selectedSamples
}) => {
    const { printers, labels, team } = useSelector((state: State) => { 
        return { printers: state.printers, labels: state.labels, team: state.team };
    });

    const [selectedPrinter, setSelectedPrinter] = useState<api.Printer | null>(null);

    const [generatedLabels, setGeneratedLabels] = useState<string[]>([]);
    const [generatingLabels, setGeneratingLabels] = useState<boolean>(false);
    const [generatingLabelsProgress, setGeneratingLabelsProgress] = useState<number>(0);

    const [selectedLabelID, setSelectedLabelID] = useState<number>(-1);

    const generateLabels = async (labelWidth: number, labelLength: number) => {
        const base64images: string[] = [];
        setGeneratingLabels(true);
        const progressIncrement = 100 / selectedSamples.length;
        for (const sample of selectedSamples) {
            const base64image = await api.generateLabelForSampleWithSize(sample.id, labelWidth, labelLength);
            setGeneratingLabelsProgress(prev => prev + progressIncrement);
            base64images.push(base64image);
        }
        setGeneratingLabels(false);
        setGeneratingLabelsProgress(0);
        setGeneratedLabels(base64images);
    }

    useEffect(() => {
        if (selectedLabelID != -1) {
            const selectedLabel = labels[team].find(label => label.id == selectedLabelID);
            if (selectedLabel) {
                generateLabels(selectedLabel.width, selectedLabel.length);
            }
        } else {
            setGeneratedLabels([]);
        }
    }, [selectedLabelID]);

    const handleClose = () => {
        setSelectedLabelID(-1);
        setGeneratingLabels(false);
        setGeneratingLabelsProgress(0);
        setGeneratedLabels([]);
        onClose();
    }

    return (
        <Dialog 
            open={open} 
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
        >            
            <DialogTitle 
                variant="h6" 
                color="primary"
                style={{ display: 'flex', justifyContent: 'center' }}
            >
                Select Label Size
            </DialogTitle>

            <DialogContent
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignSelf: 'center'
                }}
            >
                <Select
                    value={selectedLabelID}
                    onChange={(event) => {
                        setSelectedLabelID(event.target.value as number);
                    }}
                    variant='standard'
                >
                    <MenuItem value={-1}>Select a label size</MenuItem>
                    {
                        labels[team] && labels[team].length > 0 
                        ?
                        labels[team].map((label, index) => (
                            <MenuItem
                                key={index}
                                value={label.id}
                            >
                                {label.width}mm x {label.length}mm
                            </MenuItem>
                        ))
                        : <></>
                    }
                </Select>
            </DialogContent>

            <DialogTitle 
                variant="h6" 
                color="primary"
                style={{ display: 'flex', justifyContent: 'center' }}
            >
                Generated Labels
            </DialogTitle>
            <DialogContent
                style={{
                    display: 'flex',
                    justifyContent: 'space-evenly',
                    flexDirection: 'row',
                    flexWrap: 'wrap'
                }}
            >
                {
                    generatingLabels
                    ?
                    <CircularProgressWithLabel 
                        color="primary"
                        value={generatingLabelsProgress} 
                    />
                    :
                    generatedLabels.length === 0
                    ?
                    <Typography variant="body1" color="text.secondary">Select a label size...</Typography>
                    :
                    generatedLabels.map((label, index) => (
                        <img 
                            src={`data:image/png;base64,${label}`} 
                            className="generated-label"
                            key={index} 
                        />
                    ))
                }
            </DialogContent>
            <DialogContent
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignSelf: 'center'
                }}
            >
                <Typography 
                    variant="h6" 
                    color="primary"
                >
                    Select Printer: 
                </Typography>
                <Select
                    value={selectedPrinter?.ip ?? ""}
                    onChange={(event) => { 
                        setSelectedPrinter(
                            printers.find(printer => printer.ip == event.target.value)!
                        ); 
                    }}
                    variant='standard'
                >
                    {
                        printers.map((printer, index) => (
                            <MenuItem
                                key={index}
                                value={printer.ip}
                            >{printer.name} - {printer.location}</MenuItem>
                        ))
                    }
                </Select>
            </DialogContent>
            <DialogActions>
                <Button
                    disabled={selectedPrinter === null}
                    onClick={() => {
                        api.printLabels(generatedLabels, selectedPrinter!);
                    }}
                >
                    Print
                </Button>
                <Button 
                    onClick={handleClose}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    )
}


const SamplesTableToolbar: React.FC<SamplesTableToolbarProps> = ({
    selectedSamples,
    onGenerateLabelsClick
}) => {

    const team = useSelector((state: State) => state.team);
    const {
        fetchTeamsSamples,
        deleteSample
    } = useActionCreators();

    return (
        <GridToolbarContainer>
            <GridToolbar />
            
            <Button 
                startIcon={<NoteAdd />} 
                disabled={selectedSamples.length == 0} 
                onClick={onGenerateLabelsClick}
            >
                Generate Label(s)
            </Button>

            <Button 
                startIcon={<Delete />} 
                disabled={selectedSamples.length == 0} 
                onClick={() => { 
                    for (const sample of selectedSamples) {
                        deleteSample(sample.id);
                    }
                }}
            >
                Delete Sample(s)
            </Button>
            
            <Button 
                startIcon={<History />} 
                disabled={selectedSamples.length != 1}
            >
                <Link
                    to={`/samples/audit/${selectedSamples[0]?.id!}`}
                    style={{textDecoration: 'none', color: 'inherit'}}
                >
                    View Audit Table    
                </Link>
            </Button>

            <Button 
                startIcon={<Refresh />} 
                onClick={() => fetchTeamsSamples(team)}
            >
                Refresh Samples
            </Button>
        </GridToolbarContainer>
    )
}

const constantGridColumns: GridColDef[] = [
    { 
        field: "id", 
        headerName: "ID", 
        width: 150,
        editable: false
    },
    { 
        field: "date_created", 
        headerName: "Date Created", 
        flex: 0.6,
        type: "date",
        editable: false,
        valueGetter(params) {
            return DateTime.fromISO(params.value as string).toFormat("MM/dd/yyyy");
        },
    },
    { 
        field: "date_modified", 
        headerName: "Date Modified", 
        flex: 0.6,
        type: "date",
        editable: false,
        valueGetter(params) {
            return DateTime.fromISO(params.value as string).toFormat("MM/dd/yyyy");
        },
    },
    { 
        field: "expiration_date", 
        headerName: "Expiration Date", 
        flex: 0.6,
        type: "date",
        editable: true,
        valueGetter(params) {
            return DateTime.fromISO(params.value as string).toFormat("MM/dd/yyyy");
        },
        valueParser(value, params) {
            if (params === undefined) return;
            const date = DateTime.fromJSDate(value).toISO();
            params.row.expiration_date = date;
            return date;
        }
    },
];

const SamplesTable: React.FC = () => {
    
    const { team, samples, fields } = useSelector((state: State) => { 
        return {
            team: state.team,
            samples: state.samples,
            fields: state.fields
        }
    });

    const { 
        fetchAllSamples,
        fetchAllFields,
        fetchTeamsSamples,
        fetchTeamsFields,
        updateSample,
     } = useActionCreators();

     const [generateLabelDialogOpen, setGenerateLabelDialogOpen] = useState(false);

    useEffect(() => {
        if (team === undefined || team === '') {
            fetchAllSamples();
            fetchAllFields();
        } else {
            fetchTeamsSamples(team);
            fetchTeamsFields(team);
        }
    }, []);

    useEffect(() => {
        if ((team === undefined || team === '') || (fields === undefined || fields[team] === undefined)) 
            return;
        generateDynamicGridColDefs();
        // setGeneratedLabels([]);
    }, [team, fields]);

    const [dynamicGridColDefs, setDynamicGridColDefs] = useState<GridColDef[]>([]);

    /**
     * This is going to need some explanation.
     * From my understanding the material ui data grid stores the data that we pass
     * into the rows prop on their end. And since some of our data is nested in the
     * data object, we need to use the valueGetter prop to access the data. On the
     * other hand we need to use the valueParser prop to set the data. This is mainly 
     * because dates are annoying and we need to convert them to ISO strings for prisma
     * but material ui accepts JS dates or formatted dates (MM/dd/yyyy). The valueGetter returns
     * the render value and the valueParser returns the value that is stored in the data/rows object
     * stored on material uis end.
     * @returns 
     */
    const generateDynamicGridColDefs = () => {
        const dynamicGridColDefs: GridColDef[] = [];

        if ((team === undefined || team === '') || (fields === undefined || fields[team] === undefined)) 
            return setDynamicGridColDefs(dynamicGridColDefs);
        
        for (const field of fields[team]) {
            dynamicGridColDefs.push({
                field: field.name,
                headerName: field.display_name,
                flex: 1.0,
                editable: true,
                type: field.name.includes("date") ? "date" : "string",
                valueGetter(params) {
                    if (field.name.includes("date")) { 
                        if (params.row.data[field.name] === undefined) {
                            params.row.data[field.name] = DateTime.now().toISO();
                            return DateTime.now().toFormat("MM/dd/yyyy");
                        }
                        return DateTime.fromISO(params.row.data[field.name]).toFormat("MM/dd/yyyy");
                    }
                    return params.row.data[field.name] ?? "N/A";
                },
                valueParser(value, params) {
                    if (params !== undefined) {
                        if (field.name.includes("date")) {
                            const date = DateTime.fromJSDate(value); 
                            params.row.data[field.name] = date.toISO();
                        } else {
                            params.row.data[field.name] = value;
                        }
                        return params.row.data[field.name];
                    }
                },
            })
        }

        setDynamicGridColDefs(dynamicGridColDefs);
    }

    const [selectedSamples, setSelectedSamples] = useState<api.Sample[]>([]);

    const onSelectionChange = (newSelection: GridRowId[]) => {
        const newSelectedSamples: api.Sample[] = [];
        for (const sample of samples[team] ?? []) {
            if (newSelection.includes(sample.id)) {
                newSelectedSamples.push(sample);
            }
        }
        setSelectedSamples(newSelectedSamples);
    }

    const [itemsPerPage, setItemsPerPage] = useState(10);

    type DataGridSampleRow = {
        [key in keyof api.Sample]: string | number | Record<string, any>;
    };

    /**
     * Normally you would just pass the newData object to the updateSample function
     * but prisma is not expecting the updated sample to have an id, audit_id, or audit_number
     * which is currently stored in the newData object. So we need to construct a new sample
     * object without those fields. Also when a row is modified material ui will add the modified value to its internal
     * rows object as row[key] = value. But we need to store the modified value in row.data[key].
     * So if we detect that the newData object has a key that is not in the oldData object
     * we know that the value was modified once resided in the data key of the old data object
     *  and we need to move it to the data object of newData.
     */
    const onRowUpdate = (newRow: DataGridSampleRow, oldRow: DataGridSampleRow) => {
        const newSampleData: api.UpdateSampleRequirements = {
            expiration_date: DateTime.fromISO(newRow.expiration_date as string),
            date_created: DateTime.fromISO(newRow.date_created as string),
            date_modified: DateTime.now(),
            team_name: team,
            data: newRow.data as Record<string, any>
        };

        // THIS IS WHY I HATE DATES. TRYING TO SHOW THEM IN THE DATA GRID IS A NIGHTMARE
        if (newSampleData.expiration_date?.invalidExplanation !== null) {
            const newDate = DateTime.fromFormat(newRow.expiration_date as string, "MM/dd/yyyy");
            if (newDate.invalidExplanation === null) {
                newSampleData.expiration_date = newDate;
            } else {
                newSampleData.expiration_date = undefined;
            }
        }

        for (const field of fields[team]) {
            if (!oldRow.hasOwnProperty(field.name) && newRow[field.name] !== undefined) {
                newRow.data[field.name] = newRow[field.name];
                delete newRow[field.name];
            }
        }

        updateSample(oldRow.id as string, newSampleData);
        return {
            ...newRow,
            ...newSampleData,
        };
    }

    const onGenerateLabelsClick = async () => {
        // const base64images: string[] = [];
        // for (const sample of selectedSamples) {
        //     const base64image = await api.generateLabelForSampleWithSize(sample.id, 62, 100);
        //     base64images.push(base64image);
        // }
        // setGeneratedLabels(base64images);
        setGenerateLabelDialogOpen(true);
    }

    const columns = [
        constantGridColumns[0], // ID comes first
        ...dynamicGridColDefs, // Dynamic columns
        ...constantGridColumns.slice(1), // Rest of the columns (the 3 dates)
    ]

    const rows = samples[team] ?? [];

    return (
        <>
            <div
                className="data-grid-container"
            >
                <DataGrid
                    className="data-grid"
                    experimentalFeatures={{ newEditingApi: true }}
                    rows={rows}
                    columns={columns}
                    onSelectionModelChange={onSelectionChange}
                    getRowId={(row) => row.id as string}
                    processRowUpdate={(newRow: any, oldRow: any) => { onRowUpdate(newRow, oldRow)}}
                    onProcessRowUpdateError={(error) => {}}
                    pageSize={itemsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50, 100]}
                    onPageSizeChange={(pageSize) => setItemsPerPage(pageSize)}
                    isCellEditable={(params) => params.field !== "id" && params.field !== "date_created" && params.field !== "date_modified"}
                    components={{
                        Toolbar: SamplesTableToolbar
                    }}
                    componentsProps={{
                        toolbar: { selectedSamples, onGenerateLabelsClick }
                    }}
                    checkboxSelection
                    disableSelectionOnClick
                    editMode="row"
                />
            </div>
            <PrintLabelsPopupDialog 
                open={generateLabelDialogOpen}
                onClose={() => setGenerateLabelDialogOpen(false)}
                selectedSamples={selectedSamples}
            />
        </>
    );

}

export default SamplesTable;