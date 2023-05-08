import React from 'react';
import {useParams} from 'react-router-dom';
import {Stack} from '@mui/material';

import Header from '../components/header';
import Content from '../components/content';
import Footer from '../components/footer';
import Node from '../components/node';

const HomePage = () => {
    const {nodeID} = useParams<{nodeID: string}>();
    if (!nodeID) {
        return null;
    }

    return (
        <Stack>
            <Header/>
            <Node nodeID={nodeID}/>
            <Footer/>
        </Stack>
    )
}

export default HomePage;
