import React from 'react';
import {Stack} from '@mui/material';

import Header from '../components/header';
import Content from '../components/content';
import Footer from '../components/footer';
import Main from '../components/main';
import useAuth from '../hooks/useAuth';

const HomePage = () => {
    const {user} = useAuth()

    if (user) {
        return (
            <>
                <Header/>
                <Main/>
            </>
        );
    }

    return (
        <Stack>
            <Header/>
            <Content/>
            <Footer/>
        </Stack>
    )
}

export default HomePage;
