import React from 'react';
import {useNavigate} from 'react-router-dom';
import {Button, Stack, Typography} from '@mui/material';

import SearchBar from './search_bar';


const Header = () => {
    const navigate = useNavigate();

    return (
        <Stack
            id='header'
            direction={'row'}
            alignItems={'center'}
            display={'flex'}
            p={'10px 20px'}
            flexShrink={0}
        >
            <Typography
                fontSize={36}
                fontWeight={'bold'}
                color={'primary'}
                onClick={() => navigate('/')}
                sx={{cursor: 'pointer'}}
            >
                Knowledge Graph
            </Typography>
            <SearchBar/>
            <Button variant='text'>Why Knowledge Graph?</Button>
            <Button variant='text' color='secondary' onClick={() => navigate('/login')}>Sign In</Button>
            <Button variant='contained' color='secondary' onClick={() => navigate('/register')}>Sign Up For Free</Button>

        </Stack>
    );
};

export default Header;
