import React, {ChangeEvent, FormEvent, useState} from 'react';
import {Alert, Box, Button, Stack, TextField, Typography} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';

import {Client} from '../client/client';
import {ClientError} from '../client/rest';
import useQuery from '../hooks/useQuery';

interface FormData {
    password: string;
}

const ResetPasswordCompletePage = () => {
    const navigate = useNavigate();
    const {t} = useTranslation();
    const query = useQuery();
    const token = query.get("token");
    const [formData, setFormData] = useState<FormData>({password: ''});
    const [error, setError] = useState<string>('');

    if (!token) {
        return (
            <Typography>
                {t("Token is needed to reset password")}
            </Typography>
        );
    }


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        Client.User().ResetUserPassword(token, formData.password).then(() => {
            navigate('/login');
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
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 2
            }}>
                <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        {error &&
                            <Alert severity="error" onClose={() => {
                                setError('');
                            }}>
                                {error}
                            </Alert>
                        }
                        <Typography>
                            {t("Enter a new password for your account")}
                        </Typography>
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
                            {t("Change my password")}
                        </Button>
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
}


export default ResetPasswordCompletePage;
