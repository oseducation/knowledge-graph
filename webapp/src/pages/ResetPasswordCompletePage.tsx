import React from 'react';
import {Alert, Box, Button, Stack, TextField, Typography} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {Client} from '../client/client';
import {ClientError} from '../client/rest';
import useQuery from '../hooks/useQuery';

const ResetPasswordCompletePage = () => {
    const navigate = useNavigate();
    const {t} = useTranslation();
    const query = useQuery();
    const token = query.get("token");

    if (!token) {
        return (
            <Typography>
                {t("Token is needed to reset password")}
            </Typography>
        );
    }

    type FormData = {
        password: string;
    };

    const {register, handleSubmit, setError, clearErrors, formState: {errors}} = useForm<FormData>();

    const onSubmit = (data: FormData) => {
        Client.User().ResetUserPassword(token, data.password).then(() => {
            navigate('/login');
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
                            {t("Enter a new password for your account")}
                        </Typography>
                        <TextField
                            helperText={'Password'}
                            type='password'
                            {...register('password', {required: true})}
                        />
                        <Button type="submit" variant="contained">
                            {t("Change my password")}
                        </Button>
                    </Stack>
                </form>
            </Box>
        </Box>
    );
}


export default ResetPasswordCompletePage;
