import React from 'react';

import Content from '../components/content';
import Main from '../components/main';
import useAuth from '../hooks/useAuth';

const HomePage = () => {
    const {user} = useAuth()

    if (user) {
        return (
            <Main/>
        )
    }
    return (
        <Content/>
    )
}

export default HomePage;
