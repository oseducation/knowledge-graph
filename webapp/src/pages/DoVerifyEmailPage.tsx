import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {Box, Button, Typography} from '@mui/material';

import {Client} from '../client/client';

const VerifyEmailPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isVerified, setIsVerified] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const token = new URLSearchParams(location.search).get('token');
        if (token) {
            Client.User().verifyEmail(token)
                .then(() => {
                    setIsVerified(true);
                    setIsLoading(false);
                })
                .catch(error => {
                    setIsVerified(false);
                    setIsLoading(false);
                    setErrorMessage(error.response ? error.response.data.message : error.message);
                });
        } else {
            setIsLoading(false);
            setErrorMessage('No verification token provided');
        }
    }, [location]);

    const handleButtonClick = () => {
        navigate('/login');
    }

    if (isLoading) {
        return (
            <Typography variant="h6" sx={{color: 'blue', textAlign: 'center', mt: 4}}>
                Verifying...
            </Typography>
        );
    }

    if (isVerified) {
        return (
            <Box display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                sx={{height: '100vh'}}>
                <Typography variant="h6" sx={{color: 'green', textAlign: 'center'}}>
                    Email verification was successful!
                </Typography>
                <Button
                    variant="contained"
                    onClick={handleButtonClick}
                    sx={{
                        mt: 2,
                        p: 1,
                        backgroundColor: '#4CAF50',
                        '&:hover': {backgroundColor: '#45a049'},
                        borderRadius: 1,
                        fontSize: '18px'
                    }}
                >
                    Go to Login
                </Button>
            </Box>
        );
    }

    return (
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" sx={{height: '100vh'}}>
            <Typography variant="h6" sx={{color: 'red', textAlign: 'center'}}>
                Email verification failed: {errorMessage}
            </Typography>
            <Button
                variant="contained"
                onClick={handleButtonClick}
                sx={{
                    mt: 2,
                    p: 1,
                    backgroundColor: '#4CAF50',
                    '&:hover': {backgroundColor: '#45a049'},
                    borderRadius: 1,
                    fontSize: '18px'
                }}
            >
                Go to Login
            </Button>
        </Box>
    );
};

export default VerifyEmailPage;
