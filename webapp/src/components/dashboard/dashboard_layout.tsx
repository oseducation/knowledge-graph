import * as React from 'react';
import {Outlet} from 'react-router-dom';
import Grid2 from '@mui/material/Unstable_Grid2';
import {Box, CssBaseline, Drawer, Toolbar} from '@mui/material';

import {DashboardColors} from '../../ThemeOptions';
import {GraphProvider} from '../../context/graph_provider';
import useDrawer from '../../hooks/useDrawer';
import {DrawerProvider} from '../../context/drawer_provider';

import DashboardHeader from './dashboard_header';
import DashboardLHS from './dashboard_lhs';

const DashboardLayoutComp = () => {
    const {open, setOpen} = useDrawer();

    const handleDrawerToggle = () => {
        setOpen?.(!open);
    };

    return (
        <Box sx={{width: '100vw'}}>
            <CssBaseline/>
            <Box
                component="nav"
                sx={{
                    width: {sm: 240},
                    flexShrink: {sm: 0},
                }}
                aria-label="drawer"
            >
                <Drawer
                    variant="temporary"
                    open={open}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        height: '100vh',
                        overflowY: 'auto',
                        display: {xs: 'block', sm: 'block', md: 'block', lg: 'none'},
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: 240,
                            backgroundColor: DashboardColors.primary,
                        },
                    }}
                >
                    <DashboardLHS/>
                </Drawer>
            </Box>
            <Grid2 container disableEqualOverflow >
                <Grid2 xs={3} sx={{
                    height: '100vh',
                    backgroundColor: DashboardColors.primary,
                    overflowY: 'auto',
                    maxWidth: '240px',
                    display: {
                        xs: 'none',
                        sm: 'none',
                        md: 'none',
                        lg: 'block',
                    }
                }}>
                    <DashboardLHS/>
                </Grid2>
                <GraphProvider>
                    <Grid2 xs={true} sx={{height: '100vh'}} bgcolor={DashboardColors.background}>
                        <Box sx={{height: '64px'}}>
                            <Toolbar disableGutters>
                                <DashboardHeader/>
                            </Toolbar>
                        </Box>
                        <Outlet/>
                    </Grid2>
                </GraphProvider>

            </Grid2>
        </Box>
    );
}


export default function DashboardLayout() {
    return (
        <DrawerProvider>
            <DashboardLayoutComp/>
        </DrawerProvider>
    );
}
