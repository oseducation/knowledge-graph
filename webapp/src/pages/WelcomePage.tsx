import React from 'react';
import {Button, Stack} from '@mui/material';
import {useNavigate} from 'react-router-dom';

import {Client} from '../client/client';

const WelcomePage = () => {

    const navigate = useNavigate();

    const logOutHandler = () => {
        Client.User().logout().then(() => {
            navigate('/login')
        });
    }

    return (
        <Stack direction={'column'} justifyContent={'center'} alignItems={'center'}>
            <h1>Welcome Page!</h1>
            <Button onClick={logOutHandler}>Log Out</Button>
        </Stack>
    )

}

export default WelcomePage;
