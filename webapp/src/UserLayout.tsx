import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import {Container} from "@mui/material";
import {Outlet} from 'react-router-dom';

import Header from './components/header';
import {LayoutProvider} from './context/layout_provider';

export default function UserLayout() {
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
                <Header/>
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
