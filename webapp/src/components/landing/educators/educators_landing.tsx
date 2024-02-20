import React from 'react';
import {Box, Container} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

import Header from './header';
import EducatorsMain from './educators_main';


const EducatorsLanding = () => {
    return (
        <Box
            sx={{
                direction: 'column',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                maxWidth: 'false',
            }}
        >
            <Header/>
            <CssBaseline/>
            <Container
                component="main"
                maxWidth={false}
                disableGutters
            >
                <EducatorsMain/>
            </Container>
        </Box>
    )
}

export default EducatorsLanding;
