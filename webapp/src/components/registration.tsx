import React, { ChangeEvent, FormEvent, useState } from 'react';
import {Alert, Box, Button, Stack, TextField, Typography} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

import {User} from '../types/users';
import {Client} from '../client/client';
import {ClientError} from '../client/rest';
import {Analytics} from '../analytics';
import {OnboardingState} from '../types/onboarding';

declare const gtag: Gtag.Gtag;

interface FormData {
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    password: string;
}

interface Props {
    onboarding?: OnboardingState
}

const Registration = (props: Props) => {
    const navigate = useNavigate();
    const {t, i18n} = useTranslation();
    const [formData, setFormData] = useState<FormData>({
        first_name: '',
        last_name: '',
        username: '',
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


    // const {register, handleSubmit, setError, clearErrors, formState: {errors}} = useForm<FormData>();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const user = {
            first_name: formData.first_name,
            last_name: formData.last_name,
            username: formData.username,
            email: formData.email,
            password: formData.password,
        } as User;
        user.lang = i18n.language;
        if (props.onboarding) {
            Client.User().registerFromOnboarding(user, props.onboarding).then(() => {
                navigate('/verify', {
                    state: {
                        email: formData.email,
                    }
                });
            });
        } else {
            Client.User().register(user).then((user) => {
                gtag('event', 'sign_up', {
                    method: 'email'
                });
                Analytics.identify(user);
                Analytics.signUpCompleted();
                navigate('/verify', {
                    state: {
                        email: formData.email,
                    }
                });
            }).catch((err: ClientError) => {
                setError(err.message);
            })
        }
    };

    return (
        <Register>
            <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2}>
                    <Typography paragraph={true} fontSize={26} fontWeight={'bold'}>
                        {t("Create your account")}
                    </Typography>
                    {error &&
                        <Alert severity="error" onClose={() => {
                            setError('')
                        }}>
                            {error}
                        </Alert>
                    }
                    <TextField
                        required
                        label={t("First Name")}
                        variant="outlined"
                        onChange={handleChange}
                        value={formData.first_name}
                        name="first_name"
                        inputProps={{
                            autoComplete: 'off'
                        }}
                    />
                    <TextField
                        required
                        label={t("Last Name")}
                        variant="outlined"
                        onChange={handleChange}
                        value={formData.last_name}
                        name="last_name"
                        inputProps={{
                            autoComplete: 'off'
                        }}
                    />
                    <TextField
                        required
                        label={t("Username")}
                        variant="outlined"
                        onChange={handleChange}
                        value={formData.username}
                        name="username"
                        inputProps={{
                            autoComplete: 'off'
                        }}
                    />
                    <TextField
                        required
                        label={t("Email")}
                        variant="outlined"
                        type="email"
                        onChange={handleChange}
                        value={formData.email}
                        name="email"
                        inputProps={{
                            autoComplete: 'new-password'
                        }}
                    />
                    <TextField
                        required
                        label={t("Password")}
                        variant="outlined"
                        type="password"
                        onChange={handleChange}
                        value={formData.password}
                        name="password"
                        inputProps={{
                            autoComplete: 'new-password'
                        }}
                    />
                    <Button type="submit" variant="contained">
                        {t("Create account")}
                    </Button>
                </Stack>
            </Box>
        </Register>
    );
}

const Register = styled.div`
    justify-content: center;
    display: flex;
    margin-top: 4vh;
`

export default Registration;
