import { AppBar, Typography, Button, Container, Grow, Box, Toolbar, IconButton, Drawer, Divider, List, ListItem, ListItemButton, ListItemIcon } from '@mui/material';
import MenuIcon from "@mui/icons-material/Menu";
import CreateIcon from '@mui/icons-material/Create';
import PageviewIcon from '@mui/icons-material/Pageview';
import TrashIcon from '@mui/icons-material/Delete';
import FormatShapesIcon from '@mui/icons-material/FormatShapes';

import msdlogo from '../../images/msdlogo.png'
import { Link } from 'react-router-dom';
import "./styles.css";
import React, { useState } from 'react';
import { Home } from '@mui/icons-material';

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
            </Box>
        )
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

                        {/* Merck branding forbids using merck logo for "non-merck" work */}
                        {/* <div className="msg-image-container">
                        <Link to="/">
                            <img src={msdlogo} alt="MSD Logo" height="60"/>
                        </Link>
                        </div> */}
                        {children}
                    </Toolbar>
                </AppBar>
            </Box>
        </Container>
    )
}

export default NavBar