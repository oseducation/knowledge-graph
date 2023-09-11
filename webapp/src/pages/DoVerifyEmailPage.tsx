import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {Box, Button, Typography} from '@mui/material';
import {CheckCircle, Error,} from '@mui/icons-material';

import {Client} from '../client/client';
import {Analytics} from '../analytics';

enum VerifyEmailStatus {
    PENDING,
    SUCCESS,
    ERROR
}

const VerifyEmailPage = () => {
    const [isVerified, setIsVerified] = useState(VerifyEmailStatus.PENDING);
    const location = useLocation();
    const navigate = useNavigate();

    const token = new URLSearchParams(location.search).get('token');

    async function verifyEmail() {
        return Client.User().verifyEmail(token != null ? token : '');
    }

    useEffect(() => {
        let ignore = false;
        verifyEmail()
            .then(() => {
                if (!ignore) {
                    Analytics.emailVerified()
                    setIsVerified(VerifyEmailStatus.SUCCESS);
                }
            })
            .catch(() => {
                if (!ignore) {
                    setIsVerified(VerifyEmailStatus.ERROR);
                }
            });

        return () => {
            ignore = true;
        }
    }, [token]);

    const handleButtonClick = () => {
        navigate('/login');
    };

    let message = 'Email verification was successful!';
    let color = 'green';
    if (isVerified === VerifyEmailStatus.ERROR) {
        message = 'Verification Failed: We were unable to verify your email address using the link provided. This could be due to an incorrect or expired URL.'
        color = 'red';
    }

    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            sx={{
                p: 4,
                height: '100%'
            }}>
            {isVerified === VerifyEmailStatus.ERROR &&
                <Error color={"error"} sx={{fontSize: 80}}/>
            }
            {isVerified === VerifyEmailStatus.SUCCESS &&
                <CheckCircle color={"success"} sx={{fontSize: 80}}/>
            }

            <Typography variant="h6" sx={{color: {color}, textAlign: 'center'}}>
                {message}
            </Typography>
            <Button
                variant="contained"
                onClick={handleButtonClick}
                sx={{
                    mt: 2,
                    p: 1,
                    borderRadius: 1,
                    fontSize: '18px',
                    marginLeft: 'auto',
                    marginRight: 'auto'
                }}
            >
                Go to Login
            </Button>
        </Box>
    );
};

export default VerifyEmailPage;
