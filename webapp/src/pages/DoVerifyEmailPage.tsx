import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';

import {Client} from '../client/client';
import './VerifyEmailPage.css';

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
        return <p className="loading-message">Verifying...</p>;
    }

    if (isVerified) {
        return (
            <div className="verification-success">
                <p>Email verification was successful!</p>
                <button onClick={handleButtonClick}>Go to Login</button>
            </div>
        );
    }

    return (
        <div className="verification-failed">
            <p>Email verification failed: {errorMessage}</p>
            <button onClick={handleButtonClick}>Go to Login</button>
        </div>
    );
};

export default VerifyEmailPage;
