import React from 'react';
import {Stack} from '@mui/material';

import Header from '../components/header';
import Shorts from '../components/shorts';

const ShortsPage = () => {
    return (
        <Stack>
            <Header/>
            <Shorts/>
        </Stack>
    )
}

export default ShortsPage;
