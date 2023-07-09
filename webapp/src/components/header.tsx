import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import {useNavigate} from "react-router-dom";

import {Stack, styled} from "@mui/material";

import useAuth from "../hooks/useAuth";

import ProfileDropdown from "./ProfileDropdown";


function Header() {
    const [, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const navigate = useNavigate();
    const {user} = useAuth()

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

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
            src="logo.png"
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
            id="composition-button"
            sx={{
                minWidth: "max-content",
                px: 4,
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
                                    minWidth: "max-content",
                                }}>
                                Sign Up
                                For
                                Free
                            </Button>
                        </>
                        :
                        <>
                            <Button
                                variant='text'
                                style={{margin: '10px'}}
                                onClick={() => navigate('/shorts')}
                                sx={{
                                    minWidth: "max-content",
                                    color: 'white'
                                }}
                            >
                                Shorts Mode
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
