import NavBar from "../../components/NavBar/NavBar";
import { Printer } from "../../api/types";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/reducers";
import { useEffect } from "react";
import { getPrinters } from "../../redux/actions/printer";
import ListDisplay from "../../components/ListDisplay/ListDisplay";
import { ListItemIcon, Typography } from "@mui/material";
import CreatePrinterForm from "../../components/CreatePrinterForm/CreatePrinterForm";
import { Delete } from "@mui/icons-material";

import * as api from "../../api";

const PrintersPage = () => {

    const printers: Printer[] = useSelector((state: RootState) => state.printers);
    const dispatch = useDispatch();

    useEffect(() => {
        // @ts-ignore
        dispatch(getPrinters());
    }, [])

    return (
        <>
            <NavBar />
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignSelf: 'center',
                }}
            >
                <ListDisplay 
                    style={{ marginRight: '10px' }}
                    items={printers}
                    itemFormatter={(item: Printer, index) => {
                        return {
                            content: 
                                <>
                                <ListItemIcon>
                                    <Delete />
                                </ListItemIcon>
                                <Typography variant="h6" align="center" color="primary" component="div">
                                    {item.name} - {item.location}
                                </Typography>
                                </>,
                            clickable: true
                        }
                    }}
                    onListItemClick={async (item, value) => { 
                        await api.deletePrinter(value.ip);
                        // @ts-ignore
                        dispatch(getPrinters());
                    }}
                    divideItems
                />
                <CreatePrinterForm />
            </div>
        </>
    );
    
} 

export default PrintersPage;