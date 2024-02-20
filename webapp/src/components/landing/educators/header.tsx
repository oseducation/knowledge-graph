import * as React from 'react';
import {useNavigate} from "react-router-dom";
import {AppBar, Box, Toolbar, Typography, Container, Button, Stack, styled, useMediaQuery} from "@mui/material";
import {useTheme} from '@mui/material/styles';
import {useTranslation} from 'react-i18next';



function Header() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
    const {t} = useTranslation();


    function getTitle() {
        return (
            <Typography
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
            </Typography>
        );
    }

    const handleBoxClick = () => {
        navigate(-1);
    }

    function logoAndTitle() {
        return (
            <Stack
                direction="row"
                justifyContent="flex-start"
                alignItems="center"
                spacing={2}
                onClick={handleBoxClick}
                sx={{cursor: 'pointer'}}
            >
                {getLogo()}
                {!isPhone && getTitle()}
            </Stack>
        );
    }

    function getConvertButton() {
        return <Button
            color='inherit'
            variant='outlined'
            href="mailto:vitsiai.info@gmail.com"
            id="mailto-button"
            sx={{
                minWidth: {xs: 'min-content', sm: 'max-content'},
                whiteSpace: 'nowrap',
                m: '4px'
            }}
        >
            {t("Convert Your Course")}
        </Button>
    }

    return (
        <AppBar
            position="static"
            sx={{bgcolor: '#03045e'}}
        >
            <Container maxWidth={false}>
                <Toolbar disableGutters>
                    {logoAndTitle()}
                    <Spacer/>
                    {getConvertButton()}
                </Toolbar>
            </Container>
        </AppBar>
    );
}

const Spacer = styled('div')(() => ({
    position: 'relative',
    width: '100%'
}));

const getLogo = () => {
    return <Box
        component="img"
        sx={{
            height: 52,
        }}
        alt="Vitsi AI"
        src="/logo.png"
        mr="4px"
    />;
}

export default Header;
