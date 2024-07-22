import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import {Container} from "@mui/material";
import {Outlet} from 'react-router-dom';

import Header from './components/header';
import LandingHeader from './components/landing/simple/header';
import {LayoutProvider} from './context/layout_provider';
import useAuth from './hooks/useAuth';

export default function Layout() {
    const {user} = useAuth();
    return (
        <LayoutProvider>
            <Box
                sx={{
                    direction: 'column',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                    maxWidth: 'false',
                }}
            >
                {user? <Header/> : <LandingHeader/>}
                <CssBaseline/>
                <Container
                    component="main"
                    maxWidth={false}
                    disableGutters
                >
                    <Outlet/>
                </Container>
            </Box>
        </LayoutProvider>
    );
}
