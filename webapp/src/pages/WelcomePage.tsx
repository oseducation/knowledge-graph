import React from 'react';
import {Button, Stack} from '@mui/material';
import {useNavigate} from 'react-router-dom';

import {Client} from '../client/client';
import useAuth from '../hooks/useAuth';

const WelcomePage = () => {

    const navigate = useNavigate();
    const {user, setUser} = useAuth()

    const logOutHandler = () => {
        Client.User().logout().then(() => {
            setUser?.(null);
            navigate('/login')
        });
    }

    return (
        <Stack direction={'column'} justifyContent={'center'} alignItems={'center'}>
            <h1>Welcome Page!</h1>
            <h2>{'Hello  ' + user?.first_name}</h2>
            <Button onClick={logOutHandler}>Log Out</Button>
        </Stack>
    )

}

export default WelcomePage;
