import { useSelector } from "react-redux";
import { State, useActionCreators } from "../../redux";
import { Button, IconButton, Paper, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { TeamField } from "../../api";
import { Add, Delete } from "@mui/icons-material";

/**
 * * Basic Data Flow
 *   - Adding a new field will add a new field to the localFields state and to the database
 *   - On save, the localFields state will be saved to the database 
 *
 */
const EditTeamFieldsPanel: React.FC = () => {

    const { team, fields } = useSelector((state: State) => { return {
            team: state.team,
            fields: state.fields
        } 
    });

    const {
        deleteField,
        createField,
        updateField
    } = useActionCreators();

    const [localFields, setLocalFields] = useState<TeamField[]>([]);
    const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setLocalFields(fields[team] ?? []);
    }, [team, fields]);

    const onSaveTeamFields = () => {
        for (const field of localFields) {
            updateField(field.id, field);
        }
    }
    
    const updateLocalFieldValue = (id: number, key: string, value: string) => {
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        const newFields = localFields.map(field => {
            if (field.id === id) {
                return {
                    ...field,
                    [key]: value
                }
            }
            return field;
        });

        const timeout = setTimeout(() => {
            const field = newFields.find(field => field.id === id);
            updateField(id, field!);
            clearTimeout(timeout);
        }, 1000);
        
        setLocalFields(newFields);
        setDebounceTimeout(timeout);
    }

    const deleteFieldWithID = (id: number) => {
        deleteField(id);
    }

    const addEmptyField = async () => {
        createField({
            team_name: team,
            name: "",
            display_name: ""
        });
    }

    return (
        <Paper style={{ marginLeft: '50px', marginRight: '50px', padding: '10px' }}>
            <Typography variant="h5" color="primary">
                Editing Fields for '{team}' team
            </Typography>
            <Button 
                onClick={() => onSaveTeamFields()}
            >
                Save
            </Button>
            {
                localFields.map((field, index) => {
                    return (
                        <div style={{ padding: '10px' }} key={index}>
                            <span>
                                <TextField 
                                    label="Field Name"
                                    value={field.name}
                                    style={{ margin: '5px' }}
                                    onChange={(event) => updateLocalFieldValue(field.id, "name", event.target.value)}
                                />
                                <TextField 
                                    label="Field Display Name"
                                    value={field.display_name}
                                    style={{ margin: '5px' }}
                                    onChange={(event) => updateLocalFieldValue(field.id, "display_name", event.target.value)}
                                />
                                <IconButton
                                    onClick={() => deleteFieldWithID(field.id)}
                                >
                                    <Delete/>
                                </IconButton>
                            </span>
                        </div>
                    );
                })
            }
            <IconButton
                onClick={() => addEmptyField()}
            >
                <Add/>
            </IconButton>
        </Paper>
    );
}

export default EditTeamFieldsPanel;