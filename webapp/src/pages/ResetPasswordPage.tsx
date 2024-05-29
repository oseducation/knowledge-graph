import React, {ChangeEvent, FormEvent, useState} from 'react';
import {Alert, Box, Button, Stack, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';

import {Client} from '../client/client';
import {ClientError} from '../client/rest';
import AutoFillAwareTextField from '../components/autofill_aware_textfield';

interface FormData {
    email: string;
}

const ResetPasswordPage = () => {
    const {t} = useTranslation();
    const [sent, setSent] = useState(false);
    const [formData, setFormData] = useState<FormData>({email: ''});
    const [error, setError] = useState<string>('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const email = formData.email.trim().toLowerCase();
        Client.User().ResetPasswordSend(email).then(() => {
            setSent(true);
        }).catch((err: ClientError) => {
            console.log('error', err)
            setError(err.message);
        });
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };


    return (
        <Box>
            <Typography variant="h3" align="center" gutterBottom>
                {t("Reset Password")}
            </Typography>
            {sent &&
                <Alert severity="success" onClose={() => {
                    setSent(false)
                }}>
                    {t("An email has been sent to you with instructions on how to reset your password")}
                </Alert>
            }
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 2
            }}>
                <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        {error &&
                            <Alert severity="error" onClose={() => {
                                setError('')
                            }}>
                                {error}
                            </Alert>
                        }
                        <Typography>
                            {t("To reset your password, enter the email address you used to sign up")}
                        </Typography>
                        <AutoFillAwareTextField
                            label={t('Email')}
                            type={'email'}
                            onChange={handleChange}
                            value={formData.email}
                            name="email"
                        />
                        <Button type="submit" variant="contained">
                            {t("Reset my password")}
                        </Button>
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
}

export default ResetPasswordPage;
