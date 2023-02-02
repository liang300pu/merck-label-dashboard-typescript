import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

import { 
    DataGrid, 
    GridColDef, 
    GridRowId, 
    GridToolbar, 
    GridToolbarContainer 
} from "@mui/x-data-grid";
import { Button } from "@mui/material";
import { 
    Delete, 
    NoteAdd, 
    Refresh,
    History
} from "@mui/icons-material";

import { DateTime } from "luxon";

import { Sample } from "../../api";
import { State, useActionCreators } from "../../redux";

import "./styles.css"

interface SamplesTableToolbarProps {
    selectedSamples: Sample[];
}

const SamplesTableToolbar: React.FC<SamplesTableToolbarProps> = ({
    selectedSamples
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
                // onClick={onGenerateLabelsClick}
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
                {/* <Link
                    to={auditLink!(selectedSamples[0]?.audit_id)}
                    style={{textDecoration: 'none', color: 'inherit'}}
                >
                    View Audit Table    
                </Link> */}
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
        }
    },
    { 
        field: "date_modified", 
        headerName: "Date Modified", 
        flex: 0.6,
        type: "date",
        editable: false,
        valueGetter(params) {
            return DateTime.fromISO(params.value as string).toFormat("MM/dd/yyyy");
        }
    },
    { 
        field: "expiration_date", 
        headerName: "Expiration Date", 
        flex: 0.6,
        type: "date",
        editable: true,
        valueGetter(params) {
            return DateTime.fromISO(params.value as string).toFormat("MM/dd/yyyy");
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
     } = useActionCreators();

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
    }, [team, fields]);

    const [dynamicGridColDefs, setDynamicGridColDefs] = useState<GridColDef[]>([]);

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
                    return params.row.data[field.name] ?? "N/A";
                }
            })
        }

        setDynamicGridColDefs(dynamicGridColDefs);
    }

    const [selectedSamples, setSelectedSamples] = useState<Sample[]>([]);

    const onSelectionChange = (newSelection: GridRowId[]) => {
        const newSelectedSamples: Sample[] = [];
        for (const sample of samples[team] ?? []) {
            if (newSelection.includes(sample.id)) {
                newSelectedSamples.push(sample);
            }
        }
        setSelectedSamples(newSelectedSamples);
    }

    const [itemsPerPage, setItemsPerPage] = useState(10);

    return (
        <>
            <div
                className="data-grid-container"
            >
                <DataGrid
                    className="data-grid"
                    experimentalFeatures={{ newEditingApi: true }}
                    rows={samples[team] ?? []}
                    columns={[constantGridColumns[0], ...dynamicGridColDefs, ...constantGridColumns.slice(1)]}
                    onSelectionModelChange={onSelectionChange}
                    pageSize={itemsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50, 100]}
                    onPageSizeChange={(pageSize) => setItemsPerPage(pageSize)}
                    components={{
                        Toolbar: SamplesTableToolbar
                    }}
                    componentsProps={{
                        toolbar: { selectedSamples }
                    }}
                    checkboxSelection
                />
            </div>
        </>
    );

}

export default SamplesTable;