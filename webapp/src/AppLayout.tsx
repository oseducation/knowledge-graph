import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import Box from '@mui/material/Box';

import {Container} from "@mui/material";

import FooterContainer from "./Footer";
import App from "./App";
import {AppTheme} from "./ThemeOptions";
import Header from "./components/header";

const theme = createTheme(AppTheme);

export default function AppLayout() {
    return (<ThemeProvider theme={theme}>
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                maxWidth: 'false'
            }}
        >
            <Header/>
            <CssBaseline/>
            <Container component="main" sx={{mb: 2}} maxWidth={false} disableGutters>
                <App/>
            </Container>
            <FooterContainer/>
        </Box>
    </ThemeProvider>);
}

