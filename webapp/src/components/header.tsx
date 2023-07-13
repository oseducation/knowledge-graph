import * as React from 'react';
import {useNavigate} from "react-router-dom";
import {AppBar, Box, Toolbar, Typography, Container, Button, Stack, styled, useMediaQuery} from "@mui/material";
import {useTheme} from '@mui/material/styles';

import useAuth from "../hooks/useAuth";

import ProfileDropdown from "./ProfileDropdown";


function Header() {
    const navigate = useNavigate();
    const {user} = useAuth()
    const theme = useTheme();
    const isPhone = useMediaQuery(theme.breakpoints.down('sm'));


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
            align={"center"}>
            VITSI.AI
        </Typography>;
    }

    const handleBoxClick = () => {
        navigate('/')
    }

    function getLogo() {
        return <Box
            component="img"
            sx={{
                height: 54,
            }}
            alt="vitsi.ai"
            src="/logo.png"
            mr="4px"
        />;
    }

    function logoAndTitle() {
        return <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={2}
            onClick={handleBoxClick}
            sx={{cursor: 'pointer'}}
        >
            {getLogo()}
            {getTitle()}
        </Stack>;
    }

    function getLoginButton() {
        return <Button
            color='inherit'
            variant='outlined'
            onClick={() => navigate('/login')}
            id="login-button"
            sx={{
                minWidth: {xs: 'min-content', sm: 'max-content'},
                whiteSpace: 'nowrap'
            }}
        >
            Sign in
        </Button>
    }

    return (
        <AppBar position="static">
            <Container maxWidth={false}>
                <Toolbar disableGutters>
                    {logoAndTitle()}
                    <Spacer/>
                    {user == null ?
                        <>
                            {getLoginButton()}
                            <Button
                                variant='outlined'
                                color='inherit'
                                onClick={() => navigate('/register')}
                                sx={{
                                    m: 2,
                                    minWidth: {xs: 'min-content', sm: 'max-content'},
                                    whiteSpace: 'nowrap'
                                }}>
                                Sign Up
                                {isPhone? "" : " For Free"}
                            </Button>
                        </>
                        :
                        <>
                            <Button
                                variant='text'
                                style={{margin: '10px'}}
                                onClick={() => navigate('/carousel')}
                                sx={{
                                    minWidth: {xs: 'min-content', sm: 'max-content'},
                                    color: 'white',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Carousel Mode
                            </Button>
                            <ProfileDropdown/>
                        </>
                    }
                </Toolbar>
            </Container>
        </AppBar>
    );
}

const Spacer = styled('div')(() => ({
    position: 'relative',
    width: '100%'
}));

export default Header;
