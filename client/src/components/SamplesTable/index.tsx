import { useSelector } from "react-redux";
import { State, useActionCreators } from "../../redux";
import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

import "./styles.css"
import { DateTime } from "luxon";

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
                type: field.name.includes("date") ? "date" : "text",
                valueGetter(params) {
                    return params.row.data[field.name] ?? "N/A";
                }
            })
        }

        return setDynamicGridColDefs(dynamicGridColDefs);
    }

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
                    
                    checkboxSelection
                />
            </div>
        </>
    );

}

export default SamplesTable;