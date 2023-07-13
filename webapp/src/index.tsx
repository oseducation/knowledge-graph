import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import {createRoot} from 'react-dom/client';

import {AuthProvider} from './context/auth_provider';
import AppLayout from "./AppLayout";

const container = document.getElementById('root');
const root = createRoot(container!);
const isChrome = window.navigator.userAgent.includes("Chrome");

let element = (
    <React.StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <AppLayout/>
            </BrowserRouter>
        </AuthProvider>
    </React.StrictMode>
);

if (!isChrome) {
    element = <div>For better usage, please use Chrome</div>
}

root.render(element);
