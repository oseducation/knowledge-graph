import React from 'react';
import './App.css';
import {Navigate} from 'react-router-dom';

import Landing from './components/landing/founders/landing';
import useAuth from './hooks/useAuth';

function Home() {
    const {user} = useAuth();
    if (!user) {
        return (
            <Landing/>
        );
    }
    return <Navigate to="/dashboard" replace />
}

export default Home;
