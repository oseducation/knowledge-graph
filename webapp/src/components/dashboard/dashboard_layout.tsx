import * as React from 'react';
import {Outlet} from 'react-router-dom';
import Grid2 from '@mui/material/Unstable_Grid2';
import {Box, CssBaseline, Toolbar} from '@mui/material';

import useAppBarHeight from '../../hooks/use_app_bar_height';
import {DashboardColors} from '../../ThemeOptions';
import {Spacer} from '../header';
import {GraphProvider} from '../../context/graph_provider';

import DashboardHeader from './dashboard_header';
import DashboardLHS from './dashboard_lhs';

export default function DashboardLayout() {

    const staticHeight = `calc(100vh - (${useAppBarHeight()}px))`;

    return (
        <Grid2 container disableEqualOverflow>
            <CssBaseline/>
            <Grid2 xs={3} sx={{
                height: staticHeight,
                backgroundColor: DashboardColors.primary,
                overflowY: 'auto',
                maxWidth: '240px',
                display: {
                    xs: 'none',
                    sm: 'none',
                    md: 'block',
                    lg: 'block',
                }
            }}>
                <DashboardLHS/>
            </Grid2>
            <GraphProvider>
                <Grid2 xs={true} sx={{height: staticHeight}} bgcolor={DashboardColors.background}>
                    <Box sx={{height: '64px'}}>
                        <Toolbar disableGutters>
                            <Spacer/>
                            <DashboardHeader/>
                        </Toolbar>
                    </Box>
                    <Outlet/>
                </Grid2>
            </GraphProvider>

        </Grid2>
    );
}


