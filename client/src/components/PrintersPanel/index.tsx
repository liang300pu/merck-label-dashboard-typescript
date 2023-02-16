import { Paper } from '@mui/material'
import { useSelector } from 'react-redux'
import { State } from '../../redux'

import './styles.css'

function PrintersPanel() {
    const printers = useSelector((state: State) => state.printers)

    return <Paper className='printers-panel'></Paper>
}

export default PrintersPanel
