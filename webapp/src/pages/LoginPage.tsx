import React from 'react';
import {Alert, Button, Stack, TextField, Typography} from '@mui/material';
import {useLocation, useNavigate} from 'react-router-dom';
import styled from 'styled-components';
import {useForm} from "react-hook-form";
import {useTranslation} from 'react-i18next';

import {Client} from '../client/client';
import {ClientError} from "../client/rest";
import useAuth from '../hooks/useAuth';

declare const gtag: Gtag.Gtag;

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";
    const {setUser} = useAuth();
    const {t, i18n} = useTranslation();


    type FormData = {
        email: string,
        password: string
    }

    const {register, handleSubmit, setError, clearErrors, formState: {errors}} = useForm<FormData>();


    const onSubmit = (data: FormData) => {
        Client.User().login(data.email, data.password)
            .then((user) => {
                setUser?.(user);
                Client.rest.setMe(user);
                i18n.changeLanguage(user.lang);
                gtag('event', 'login', {
                    method: 'email'
                });
                return navigate(from, {replace: true});
            }).catch((err: ClientError) => {
                setError('root', {type: 'server', message: err.message});
            })
    }

    const handleRegisterClick = () => {
        navigate('/register')
    }

    return (
        <Login>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack direction={'column'} spacing={1} alignItems={'center'}>
                    <Typography paragraph={true} fontSize={26} fontWeight={'bold'}>
                        {t("Login")}
                    </Typography>
                    {errors.root &&
                        <Alert severity="error" onClose={() => {clearErrors()}} >
                            {errors.root.message}
                        </Alert>
                    }
                    <TextField
                        fullWidth
                        label={t('Email')}
                        type={'email'}
                        {...register("email", {required: true})}
                    />
                    <TextField
                        fullWidth
                        label={t('Password')}
                        type={'password'}
                        {...register("password", {required: true})}
                    />
                    <Stack direction={'row'} justifyContent={'center'}>
                        <Button type={'submit'}>{t("Log in")}</Button>
                        <Button id="register" onClick={handleRegisterClick}>{t("Register")}</Button>
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
