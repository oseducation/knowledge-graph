import React from 'react';
import {useLocation, useNavigate} from "react-router-dom";
import {Box, Button, Stack, Typography} from "@mui/material";

import Footer from "../components/footer";

const VerifyPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const navigateToLogin = () => {
        navigate("/login")
    };

    return (
        <Stack>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                height="100vh"
            >
                <Typography variant="h2">Almost There!</Typography>
                <Typography
                    variant="body1"
                    maxWidth="60%"
                    textAlign="center"
                >
                    We just sent a verification email to:
                    <span style={{color: '#000', fontWeight: 'bold', marginLeft: '1rem'}}>
                        {location.state?.email}
                    </span>.
                    Please check your inbox (and spam folder!) to confirm your account. Let&apos;s get you on board!
                </Typography>
                <Button
                    onClick={navigateToLogin}
                    variant="contained"
                    color="success"
                    sx={{
                        m: 2,
                        borderRadius: '4px',
                    }}
                >
                    Back to Login
                </Button>
            </Box>
            <Footer/>
        </Stack>
    );
};

export default VerifyPage;
