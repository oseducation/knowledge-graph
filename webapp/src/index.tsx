import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import {createRoot} from 'react-dom/client';
import {ThemeProvider, createTheme, responsiveFontSizes} from '@mui/material';

import './i18n';

import {AuthProvider} from './context/auth_provider';
import App from './App';
import {AppTheme} from './ThemeOptions';
import {GraphProvider} from './context/graph_provider';

const container = document.getElementById('root');
const root = createRoot(container!);
let theme = createTheme(AppTheme);
theme = responsiveFontSizes(theme);

const element = (
    <React.StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <ThemeProvider theme={theme}>
                    <GraphProvider>
                        <App/>
                    </GraphProvider>
                </ThemeProvider>
            </BrowserRouter>
        </AuthProvider>
    </React.StrictMode>
);


root.render(element);
