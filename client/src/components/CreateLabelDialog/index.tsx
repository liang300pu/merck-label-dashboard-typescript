import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Select,
    TextField,
    Typography,
} from '@mui/material'
import { CreateTeamLabelRequirements, TeamLabel, createLabel } from '../../api'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { State } from '../../redux'

export interface CreateLabelDialogProps {
    open?: boolean
    onClose?: () => void
    onSubmit?: (label: TeamLabel) => void
}

const CreateLabelDialog: React.FC<CreateLabelDialogProps> = ({
    open = false,
    onClose,
    onSubmit,
}) => {
    const { team, teams } = useSelector((state: State) => ({
        team: state.team,
        teams: state.teams,
    }))

    const resetState = () => {
        setNewLabelName('')
        setNewLabelWidth(0)
        setNewLabelLength(0)
    }

    const onDialogClose = () => {
        onClose?.()
    }

    const onCreateLabelClick = async () => {
        const label: CreateTeamLabelRequirements = {
            name: newLabelName,
            width: newLabelWidth,
            length: newLabelLength,
            team_name: newLabelTeam,
            data: [],
        }
        console.log(label)
        const newLabel = await createLabel(label)
        onSubmit?.(newLabel)
        onClose?.()
        resetState()
    }

    const [newLabelName, setNewLabelName] = useState('')
    const [newLabelWidth, setNewLabelWidth] = useState(0)
    const [newLabelLength, setNewLabelLength] = useState(0)
    const [newLabelTeam, setNewLabelTeam] = useState(team ?? '')

    return (
        <Dialog
            open={open}
            maxWidth='md'
            onClose={onDialogClose}
            fullWidth
            // This ensures that the dialog has a constant height
            // Normally it is in a flexbox so when we add the label images it
            // would adjust the height accordingly. Doing this we wont get the resizing
            // we will just get a scroll bar if the images are too big
            PaperProps={{
                sx: {
                    height: '75vh',
                },
            }}
        >
            <DialogTitle
                variant='h6'
                color='primary'
                borderColor='primary'
                borderBottom={1}
            >
                Create Label
            </DialogTitle>
            <DialogContent>
                <div>
                    <Typography>Team: </Typography>
                    <Select
                        label='team'
                        value={newLabelTeam}
                        onChange={(event) =>
                            setNewLabelTeam(event.target.value as string)
                        }
                    >
                        {teams.map((team, index) => (
                            <MenuItem key={index} value={team.name}>
                                {team.name}
                            </MenuItem>
                        ))}
                    </Select>
                </div>
                <div>
                    <Typography>Name: </Typography>
                    <TextField
                        label='name'
                        type='text'
                        value={newLabelName}
                        onChange={(event) =>
                            setNewLabelName(event.target.value)
                        }
                    />
                </div>
                <div>
                    <Typography>Width: </Typography>
                    <TextField
                        label='width'
                        type='number'
                        value={newLabelWidth}
                        onChange={(event) =>
                            setNewLabelWidth(parseInt(event.target.value))
                        }
                    />
                </div>
                <div>
                    <Typography>Length: </Typography>
                    <TextField
                        label='length'
                        type='number'
                        value={newLabelLength}
                        onChange={(event) =>
                            setNewLabelLength(parseInt(event.target.value))
                        }
                    />
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCreateLabelClick}>Create Label</Button>
                <Button onClick={onDialogClose}>Close</Button>
            </DialogActions>
        </Dialog>
    )
}

export default CreateLabelDialog
