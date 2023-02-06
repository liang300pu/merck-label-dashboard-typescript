import { 
    AppBar, 
    Typography, 
    Container, 
    Box, 
    Toolbar, 
    IconButton, 
    Drawer, 
    Divider, 
    List, 
    ListItem, 
    ListItemButton, 
    ListItemIcon, 
    Select, 
    MenuItem 
} from '@mui/material';
import MenuIcon from "@mui/icons-material/Menu";
import CreateIcon from '@mui/icons-material/Create';
import PageviewIcon from '@mui/icons-material/Pageview';
import FormatShapesIcon from '@mui/icons-material/FormatShapes';

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
                    <Link to="/" className="link-button">
                        <ListItem key={"home"} disablePadding>
                            <ListItemButton
                                style={{ width: '100%' }}
                            >
                                
                                    <ListItemIcon>
                                        <Home />
                                        <Typography variant="h6" color="primary">
                                            Home
                                        </Typography>
                                    </ListItemIcon>
                            </ListItemButton>
                        </ListItem>
                    </Link>

                    <Link to="/editor" className="link-button">
                        <ListItem key={"editor"} disablePadding>
                            <ListItemButton style={{ textAlign: "center" }}>
                                
                                    <ListItemIcon>
                                        <FormatShapesIcon />
                                        <Typography variant="h6" align="center" color="primary" component="div">
                                            Label Editor
                                        </Typography>
                                    </ListItemIcon>
                                
                            </ListItemButton>
                        </ListItem>
                    </Link>
                </List>

                <Divider /> 

                <List>
                    <Link to="/samples/create" className="link-button">
                        <ListItem key={"create-sample"} disablePadding>
                            <ListItemButton>
                                
                                    <ListItemIcon>
                                        <CreateIcon />
                                        <Typography variant="h6" color="primary">
                                            Create Sample
                                        </Typography>
                                    </ListItemIcon>
                                
                            </ListItemButton>
                        </ListItem>
                    </Link>

                    <Link to="/samples" className="link-button">
                        <ListItem key={"view-team-samples"} disablePadding>
                            <ListItemButton>
                                
                                    <ListItemIcon>
                                        <PageviewIcon />
                                        <Typography variant="h6" color="primary">
                                            View Samples
                                        </Typography>
                                    </ListItemIcon>
                                
                            </ListItemButton>
                        </ListItem>
                    </Link>

                    <Link to="/samples/deleted" className="link-button">
                        <ListItem key={"view-deleted-samples"} disablePadding>
                            <ListItemButton>
                                
                                    <ListItemIcon>
                                        <PageviewIcon />
                                        <Typography variant="h6" color="primary">
                                            View Deleted Samples
                                        </Typography>
                                    </ListItemIcon>
                                
                            </ListItemButton>
                        </ListItem>
                    </Link>

                    <Link to="/fields" className="link-button">
                      <ListItem key={"edit-team-fields"} disablePadding>
                            <ListItemButton>
                                
                                    <ListItemIcon>
                                        <EditAttributes />
                                        <Typography variant="h6" color="primary">
                                            Edit Team Fields
                                        </Typography>
                                    </ListItemIcon>
                                
                            </ListItemButton>
                        </ListItem>
                    </Link>
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
        <Container className="nav-container">
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