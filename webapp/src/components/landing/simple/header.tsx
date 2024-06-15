import * as React from 'react';
import {useNavigate} from "react-router-dom";
import {AppBar, Box, Toolbar, Typography, Container, Button, Stack, styled, useMediaQuery} from "@mui/material";
import {useTheme} from '@mui/material/styles';
import {useTranslation} from 'react-i18next';

import {Analytics} from '../../../analytics';


function LandingHeader() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
    const {t} = useTranslation();

    if (location.pathname === '/onboarding') {
        return null;
    }

    function getTitle() {
        return <Typography
            variant="h6"
            noWrap
            sx={{
                minWidth: "max-content",
                mr: 2,
                display: {xs: 'none', sm: 'block'},
                fontWeight: 700,
                letterSpacing: '.3rem',
            }}
            color='primary'
            align={"center"}>
            VITSI.AI
        </Typography>;
    }

    function logoAndTitle() {
        return <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={2}
            onClick={()=>navigate('/')}
            sx={{cursor: 'pointer'}}
        >
            {getLogo()}
            {!isPhone && getTitle()}
        </Stack>;
    }

    function getLoginButton() {
        return <Button
            color='primary'
            variant='contained'
            onClick={() => navigate('/login')}
            id="login-button"
            sx={{
                minWidth: {xs: 'min-content', sm: 'max-content'},
                whiteSpace: 'nowrap',
                m: '4px'
            }}
        >
            {t("Sign in")}
        </Button>
    }

    return (
        <AppBar position="static" color='transparent'>
            <Container maxWidth={false}>
                <Toolbar disableGutters>
                    {logoAndTitle()}
                    <Spacer/>
                    <Button
                        variant='text'
                        color='primary'
                        onClick={() => navigate('/pricing')}
                        sx={{
                            m: {xs: 1, sm: 1, md: 2},
                            minWidth: {xs: 'min-content', sm: 'max-content'},
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {t("Pricing")}
                    </Button>
                    {getLoginButton()}
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={() => {
                            Analytics.signUpStarted("header");
                            navigate('/register');
                        }}
                        sx={{
                            m: {xs: 1, sm: 1, md: 2},
                            minWidth: {xs: 'min-content', sm: 'max-content'},
                            whiteSpace: 'nowrap'
                        }}>
                        {isPhone?t("Sign Up") : t("Sign Up For Free")}
                    </Button>
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export const Spacer = styled('div')(() => ({
    position: 'relative',
    width: '100%'
}));

export const getLogo = () => {
    return <Box
        component="img"
        sx={{
            height: 52,
        }}
        alt="Vitsi AI"
        src="/android-chrome-512x512.png"
        mr="4px"
    />;
}

export default LandingHeader;
