import React from 'react';
import {useFormik} from 'formik';
import {Button, Stack, TextField} from '@mui/material';
import {useNavigate} from 'react-router-dom';
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
                .then(r => navigate('/welcome'))
        }
    });

    const handleRegisterClick = () => {
        navigate('/register')
    }

    return (
        <div style={{justifyContent: 'center', display: 'flex', marginTop: '4vh'}}>
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
        </div>
    )
}

export default LoginPage;
