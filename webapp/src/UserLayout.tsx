import * as React from 'react';
import {createTheme, ThemeProvider} from '@mui/material/styles';

import {AppTheme} from "./ThemeOptions";
import {DrawerProvider} from './context/drawer_provider';
import {GraphProvider} from './context/graph_provider';
import GuestLayout from './GuestLayout';

export default function UserLayout() {
    return (
        <DrawerProvider>
            <GraphProvider>
                <GuestLayout/>
            </GraphProvider>
        </DrawerProvider>
    );
}
