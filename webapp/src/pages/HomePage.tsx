import React from 'react';
import {Stack} from '@mui/material';

import Header from '../components/header';
import Content from '../components/content';
import Graph from '../components/graph/graph_component';
import Footer from '../components/footer';
import LHSNavigation from '../components/lhs/lhs_navigation';


const HomePage = () => {
    return (
        <Stack>
            <Header/>
            <Content/>
            <Stack direction={'row'}>
                <LHSNavigation/>
                <Graph/>
            </Stack>
            <Footer/>
        </Stack>
    )
}

export default HomePage;
