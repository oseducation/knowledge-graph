import React, {useState} from 'react';
import {Alert, Box, Button, Stack, TextField, Typography} from '@mui/material';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {Client} from '../client/client';
import {ClientError} from '../client/rest';

const ResetPasswordPage = () => {
    const {t} = useTranslation();
    const [sent, setSent] = useState(false);

    type FormData = {
        email: string;
    };

    const {register, handleSubmit, setError, clearErrors, formState: {errors}} = useForm<FormData>();

    const onSubmit = (data: FormData) => {
        const email = data.email.trim().toLowerCase();
        Client.User().ResetPasswordSend(email).then(() => {
            setSent(true);
        }).catch((err: ClientError) => {
            console.log('error', err)
            setError('root', {type: 'server', message: err.message});
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
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={2}>
                        {errors.root &&
                            <Alert severity="error" onClose={() => {
                                clearErrors()
                            }}>
                                {errors.root.message}
                            </Alert>
                        }
                        <Typography>
                            {t("To reset your password, enter the email address you used to sign up")}
                        </Typography>
                        <TextField
                            helperText={'Email'}
                            type='email'
                            {...register('email', {required: true})}
                        />
                        <Button type="submit" variant="contained">
                            {t("Reset my password")}
                        </Button>
                    </Stack>
                </form>
            </Box>
        </Box>
    );
}

export default ResetPasswordPage;
