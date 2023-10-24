import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import {createRoot} from 'react-dom/client';

import './i18n';

import {AuthProvider} from './context/auth_provider';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container!);

const element = (
    <React.StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </AuthProvider>
    </React.StrictMode>
);


root.render(element);
