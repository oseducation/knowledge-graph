import React from 'react';
import {useFormik} from 'formik';
import {Button, Stack, TextField} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import {Client} from '../client/client';

const LoginPage = () => {

    const navigate = useNavigate();


    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        onSubmit: () => {
            Client.User().login(formik.values.email, formik.values.password)
                .then(() => navigate('/welcome'))
        }
    });

    const handleRegisterClick = () => {
        navigate('/register')
    }

    return (
        <Login>
            <form onSubmit={formik.handleSubmit}>
                <Stack direction={'column'} spacing={1}>
                    <TextField
                        fullWidth
                        id={'email'}
                        name={'email'}
                        label={'Email'}
                        value={formik.values.email}
                        onChange={formik.handleChange}
                    />
                    <TextField
                        fullWidth
                        id={'password'}
                        name={'password'}
                        label={'Password'}
                        type={'password'}
                        value={formik.values.password}
                        onChange={formik.handleChange}
                    />
                    <Stack direction={'row'} justifyContent={'center'}>
                        <Button type={'submit'}>Log in</Button>
                        <Button onClick={handleRegisterClick}>Register</Button>
                    </Stack>
                </Stack>
            </form>
        </Login>
    )
}

const Login = styled.div`
    justify-content: center;
    display: flex;
    margin-top: 4vh;
`

export default LoginPage;
