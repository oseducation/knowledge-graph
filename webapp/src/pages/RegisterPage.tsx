import React from 'react';
import {Alert, Button, Stack, TextField, Typography} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {User} from '../types/users';
import {Client} from '../client/client';
import {ClientError} from '../client/rest';

declare const gtag: Gtag.Gtag;

const RegisterPage = () => {
    const navigate = useNavigate();
    const {t} = useTranslation();

    type FormData = {
        first_name: string;
        last_name: string;
        username: string;
        email: string;
        password: string;
    };

    const {register, handleSubmit, setError, clearErrors, formState: {errors}} = useForm<FormData>();

    const onSubmit = (data: FormData) => {
        Client.User().register(data as User).then(() => {
            gtag('event', 'sign_up', {
                method: 'email'
            });
            navigate('/verify', {
                state: {
                    email: data.email,
                }
            });
        }).catch((err: ClientError) => {
            setError('root', {type: 'server', message: err.message});
        })
    };

    return (
        <Register>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={2}>
                    <Typography paragraph={true} fontSize={26} fontWeight={'bold'}>
                        {t("Create your account")}
                    </Typography>
                    {errors.root &&
                        <Alert severity="error" onClose={() => {
                            clearErrors()
                        }}>
                            {errors.root.message}
                        </Alert>
                    }
                    <TextField
                        label={t("First Name")}
                        variant="outlined"
                        {...register("first_name")}
                    />
                    <TextField
                        label={t("Last Name")}
                        variant="outlined"
                        {...register('last_name')}
                    />
                    <TextField
                        required
                        label={t("Username")}
                        variant="outlined"
                        {...register('username', {required: true})}
                    />
                    <TextField
                        required
                        label={t("Email")}
                        variant="outlined"
                        type="email"
                        {...register('email', {required: true})}
                    />
                    <TextField
                        required
                        label={t("Password")}
                        variant="outlined"
                        type="password"
                        {...register('password', {required: true})}
                    />
                    <Button type="submit" variant="contained">
                        {t("Create account")}
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
