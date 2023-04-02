import React from 'react';
import {useFormik} from 'formik';
import {Button, Stack, TextField} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import {User} from '../types/users';
import {Client} from '../client/client';

const RegisterPage = () => {

    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        onSubmit: () => {
            const user = {
                email: formik.values.email,
                password: formik.values.password
            } as User
            Client.User().register(user).then(() => navigate('/login'))
        }
    });

    return (
        <Register>
            <form onSubmit={formik.handleSubmit}>
                <Stack direction={'column'} spacing={1}>
                    <TextField
                        fullWidth
                        id={'email'}
                        name={'email'}
                        label={'Email'}
                        type={'email'}
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
                        <Button type={'submit'}>Register</Button>
                    </Stack>
                </Stack>
            </form>
        </Register>
    )
}

const Register = styled.div`
    justify-content: center;
    display: flex;
    margin-top: 4vh;
`

export default RegisterPage;
