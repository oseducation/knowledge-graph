import React from 'react';

import Main from '../components/main';
import useAuth from '../hooks/useAuth';
import Landing from '../components/landing/landing';

const HomePage = () => {
    const {user} = useAuth()

    if (user) {
        return (
            <Main/>
        )
    }
    return (
        <Landing/>
    )
}

export default HomePage;
