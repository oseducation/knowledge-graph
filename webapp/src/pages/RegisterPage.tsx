import React from 'react';
import {Alert, Button, Stack, TextField, Typography} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';
import {useForm} from 'react-hook-form';

import {User} from '../types/users';
import {Client} from '../client/client';
import {ClientError} from '../client/rest';

const RegisterPage = () => {
    const navigate = useNavigate();

    type FormData = {
        firstName: string;
        lastName: string;
        username: string;
        email: string;
        password: string;
    };

    const {register, handleSubmit, setError, clearErrors, formState: {errors}} = useForm<FormData>();

    const onSubmit = (data: FormData) => {
        Client.User().register(data as User).then(() => navigate('/login')).catch((err: ClientError) => {
            setError('root', {type: 'server', message: err.message});
        })
    };

    return (
        <Register>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={2}>
                    <Typography paragraph={true} fontSize={26} fontWeight={'bold'}>
                        Create your account
                    </Typography>
                    {errors.root &&
                        <Alert severity="error" onClose={() => {clearErrors()}} >
                            {errors.root.message}
                        </Alert>
                    }
                    <TextField
                        label="First Name"
                        variant="outlined"
                        {...register("firstName")}
                    />
                    <TextField
                        label="Last Name"
                        variant="outlined"
                        {...register('lastName')}
                    />
                    <TextField
                        required
                        label="Username"
                        variant="outlined"
                        {...register('username', { required: true })}
                    />
                    <TextField
                        required
                        label="Email"
                        variant="outlined"
                        type="email"
                        {...register('email', { required: true })}
                    />
                    <TextField
                        required
                        label="Password"
                        variant="outlined"
                        type="password"
                        {...register('password', { required: true })}
                    />
                    <Button type="submit" variant="contained">
                        Create account
                    </Button>
                </Stack>
            </form>
        </Register>
    );
}

const Register = styled.div`
    justify-content: center;
    display: flex;
    margin-top: 4vh;
`

export default RegisterPage;
