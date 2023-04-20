import React from 'react';
import {Stack} from '@mui/material';

import Header from '../components/header';
import Content from '../components/content';
import Graph from '../components/graph';
import Footer from '../components/footer';


const HomePage = () => {
    return (
        <Stack>
            <Header/>
            <Content/>
            <Graph/>
            <Footer/>
        </Stack>
    )
}

export default HomePage;
