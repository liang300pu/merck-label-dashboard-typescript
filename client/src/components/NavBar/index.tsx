import { AppBar, Typography, Button, Container, Grow, Box, Toolbar, IconButton, Drawer, Divider, List, ListItem, ListItemButton, ListItemIcon, Select, MenuItem } from '@mui/material';
import MenuIcon from "@mui/icons-material/Menu";
import CreateIcon from '@mui/icons-material/Create';
import PageviewIcon from '@mui/icons-material/Pageview';
import TrashIcon from '@mui/icons-material/Delete';
import FormatShapesIcon from '@mui/icons-material/FormatShapes';

import msdlogo from '../../images/msdlogo.png'
import { Link } from 'react-router-dom';
import "./styles.css";
import React, { useEffect, useState } from 'react';
import { EditAttributes, Home } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { State, useActionCreators, useFetchAll } from '../../redux';

const NavBar: React.FC<React.PropsWithChildren> = ({ children }: React.PropsWithChildren) => {
    const [isSideBarOpen, setIsSideBarOpen] = useState(false);

    const toggleDrawer = () => {
        setIsSideBarOpen(!isSideBarOpen);
    }

    const Sidebar = () => {
        return (
            <Box
                sx={{ width: 300 }}
                role="presentation"
                onClick={toggleDrawer}
                onKeyDown={toggleDrawer}
            >
                <List>
                    <ListItem key={"home"} disablePadding>
                        <ListItemButton>
                            <Link to="/" className="link-button">
                                <ListItemIcon>
                                    <Home />
                                    <Typography variant="h6" color="primary">
                                        Home
                                    </Typography>
                                </ListItemIcon>
                            </Link>
                        </ListItemButton>

                    </ListItem>

                    <ListItem key={"editor"} disablePadding>
                        <ListItemButton style={{ textAlign: "center" }}>
                            <Link to="/editor" className="link-button">
                                <ListItemIcon>
                                    <FormatShapesIcon />
                                    <Typography variant="h6" align="center" color="primary" component="div">
                                        Label Editor
                                    </Typography>
                                </ListItemIcon>
                            </Link>
                        </ListItemButton>
                    </ListItem>
                </List>

                <Divider /> 

                <List>
                    <ListItem key={"create-sample"} disablePadding>
                        <ListItemButton>
                            <Link to="/samples/create" className="link-button">
                                <ListItemIcon>
                                    <CreateIcon />
                                    <Typography variant="h6" color="primary">
                                        Create Sample
                                    </Typography>
                                </ListItemIcon>
                            </Link>
                        </ListItemButton>
                    </ListItem>

                    <ListItem key={"view-team-samples"} disablePadding>
                        <ListItemButton>
                            <Link to="/samples" className="link-button">
                                <ListItemIcon>
                                    <PageviewIcon />
                                    <Typography variant="h6" color="primary">
                                        View Samples
                                    </Typography>
                                </ListItemIcon>
                            </Link>
                        </ListItemButton>
                    </ListItem>

                    <ListItem key={"view-deleted-sample"} disablePadding>
                        <ListItemButton>
                            <Link to="/samples/deleted" className="link-button">
                                <ListItemIcon>
                                    <PageviewIcon />
                                    <Typography variant="h6" color="primary">
                                        View Deleted Samples
                                    </Typography>
                                </ListItemIcon>
                            </Link>
                        </ListItemButton>
                    </ListItem>

                    <ListItem key={"edit-team-fields"} disablePadding>
                        <ListItemButton>
                            <Link to="/fields" className="link-button">
                                <ListItemIcon>
                                    <EditAttributes />
                                    <Typography variant="h6" color="primary">
                                        Edit Team Fields
                                    </Typography>
                                </ListItemIcon>
                            </Link>
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>
        )
    }

    const fetchAll = useFetchAll();
    const state = useSelector((state: State) => state);
    const { 
        setTeam, 
    } = useActionCreators();

    useEffect(() => {
        fetchAll();
        const lsTeam = localStorage.getItem("team");
        if (lsTeam) {
            setTeam(lsTeam);
        }
    }, []);

    const onTeamChange = (event) => {
        // Replace fetch all with only fetching the current teams
        fetchAll();
        localStorage.setItem("team", event.target.value);
        setTeam(event.target.value);
    }

    return (        
        <Container>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static" color="inherit" style={{ padding: '10px', margin: '10px' }}>
                    <Toolbar className="nav-toolbar">
                        <React.Fragment key={"sidebar"}>
                            <IconButton
                                size="large"
                                edge="start"
                                aria-label="menu"
                                onClick={toggleDrawer} 
                                onKeyDown={toggleDrawer}
                            >
                                <MenuIcon />
                            </IconButton>   
                            <Drawer
                                anchor={"left"}
                                open={isSideBarOpen}
                                onClose={toggleDrawer}
                            >
                                <Sidebar />
                            </Drawer>   
                        </React.Fragment>

                        <Typography variant="h4" align="center" color="primary" component="div">
                            Merck Label Dashboard
                        </Typography>

                        <div> 
                            <Select
                                value={state.team}
                                onChange={(event) => onTeamChange(event)}
                            >
                                {
                                    state.teams.map((team, _) => 
                                        <MenuItem
                                            key={_}
                                            value={team.name}
                                        >
                                            {team.name}
                                        </MenuItem>
                                    )
                                }
                            </Select>
                        </div>
                    </Toolbar>
                </AppBar>
            </Box>
        </Container>
    )
}

export default NavBar