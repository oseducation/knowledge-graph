import React, {lazy} from 'react';
import './App.css';
import {Navigate} from 'react-router-dom';

import useAuth from './hooks/useAuth';

const SimpleMain = lazy(() => import('./components/landing/simple/simple_main'));

function Home() {
    const {user} = useAuth();
    if (!user) {
        return (
            <SimpleMain/>
        );
    }
    return <Navigate to="/dashboard" replace />
}

export default Home;
