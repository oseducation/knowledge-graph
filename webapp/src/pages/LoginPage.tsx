import React, {ChangeEvent, FormEvent, useState} from 'react';
import {Alert, Box, Button, Link, Stack, Typography} from '@mui/material';
import {useLocation, useNavigate} from 'react-router-dom';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

import {Client} from '../client/client';
import {ClientError} from "../client/rest";
import useAuth from '../hooks/useAuth';
import {Analytics} from '../analytics';
import AutoFillAwareTextField from '../components/autofill_aware_textfield';

declare const gtag: Gtag.Gtag;

interface FormData {
    email: string;
    password: string;
}

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";
    const {setUser} = useAuth();
    const {t, i18n} = useTranslation();
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: ''
    });
    const [error, setError] = useState<string>('');

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        Client.User().login(formData.email, formData.password)
            .then((user) => {
                setUser?.(user);
                Client.rest.setMe(user);
                i18n.changeLanguage(user.lang);
                gtag('event', 'login', {
                    method: 'email'
                });
                Analytics.identify(user);
                Analytics.loginCompleted();
                return navigate(from, {replace: true});
            }).catch((err: ClientError) => {
                setError(err.message);
            })
    }

    const handleRegisterClick = () => {
        navigate('/register')
    }

    return (
        <Login>
            <Box component="form" onSubmit={handleSubmit}>
                <Stack direction={'column'} spacing={1} alignItems={'center'}>
                    <Typography paragraph={true} fontSize={26} fontWeight={'bold'}>
                        {t("Login")}
                    </Typography>
                    {error &&
                        <Alert severity="error" onClose={() => {setError('')}} >
                            {error}
                        </Alert>
                    }
                    <AutoFillAwareTextField
                        fullWidth
                        label={t('Email')}
                        type={'email'}
                        onChange={handleChange}
                        value={formData.email}
                        name="email"
                    />
                    <AutoFillAwareTextField
                        fullWidth
                        label={t('Password')}
                        type={'password'}
                        onChange={handleChange}
                        value={formData.password}
                        name="password"
                    />
                    <Stack direction={'row'} justifyContent={'center'}>
                        <Button type={'submit'}>{t("Log in")}</Button>
                        <Button id="register" onClick={handleRegisterClick}>{t("Register")}</Button>
                    </Stack>
                    <Link id="reset-password" onClick={() => navigate('/reset-password')}>{t("Forgot your password?")}</Link>
                </Stack>
            </Box>
        </Login>
    )
}

const Login = styled.div`
    justify-content: center;
    display: flex;
    margin-top: 4vh;
`

export default LoginPage;
