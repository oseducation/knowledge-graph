import React from 'react';
import {Stack} from '@mui/material';

import Header from '../components/header';
import Content from '../components/content';
import Footer from '../components/footer';
import Main from '../components/main';

const HomePage = () => {
    return (
        <Stack>
            <Header/>
            <Content/>
            <Main/>
            <Footer/>
        </Stack>
    )
}

export default HomePage;
