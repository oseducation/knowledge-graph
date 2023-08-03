import * as React from 'react';
import Button from '@mui/material/Button';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ProgressIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import {Dialog, ListItemIcon, MenuItem, Stack, useMediaQuery} from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';
import {useTheme} from '@mui/material/styles';
import {useTranslation} from 'react-i18next';

import {useNavigate} from "react-router-dom";

import {ArrowDropDown, Person2Outlined} from "@mui/icons-material";

import {Client} from "../client/client";
import useAuth from "../hooks/useAuth";

import Preferences from "./preferences";


const ProfileDropdown = () => {
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorElUser)
    const {user, setUser} = useAuth()
    const navigate = useNavigate();
    const [openPreferences, setOpenPreferences] = React.useState(false);
    const theme = useTheme();
    const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
    const {t} = useTranslation();

    const profileDestinations = [
        {destination: '/profile', displayName: t('Profile'), icon: <AccountCircleIcon/>},
        {destination: '/preferences', displayName: t('Preferences'), icon: <SettingsIcon/>},
        {destination: '/', displayName: t('Progress'), icon: <ProgressIcon/>},
        {destination: '/logout', displayName: t('Logout'), icon: <LogoutIcon/>}
    ]

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    function logout() {
        Client.User().logout().then(() => {
            setUser?.(null);
            navigate('/login')
        });
    }

    const handlePreferences = () => {
        setOpenPreferences(true);
    }

    const handleCloseUserMenu = (destination: string) => {
        setAnchorElUser(null);

        // handle all cases here from the profileDestinations array
        switch (destination) {
        case '/profile':
            navigate('/profile');
            break;
        case '/preferences':
            handlePreferences();
            break;
        case '/':
            navigate('/');
            break;
        case '/logout':
            logout();
            break;
        default:
            break;
        }
    };

    return <Stack direction="row" spacing={2}>

        <Box sx={{flexGrow: 0}}>
            <Button
                aria-haspopup="true"
                variant='outlined'
                color='inherit'
                onClick={handleOpenUserMenu}
                id="composition-button"
                startIcon={<Person2Outlined/>}
                endIcon={<ArrowDropDown/>}
                sx={{
                    textTransform: "none",
                }}
            >
                {!isPhone && user?.username}
            </Button>
            <Menu
                sx={{mt: '45px'}}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={open}
                onClose={handleCloseUserMenu}
            >
                {profileDestinations.map((destination) => (
                    <MenuItem
                        key={"profileMenu" + destination.displayName}
                        onClick={() => handleCloseUserMenu(destination.destination)}
                    >
                        <ListItemIcon>
                            {destination.icon}
                        </ListItemIcon>
                        {destination.displayName}
                    </MenuItem>
                ))}


            </Menu>
        </Box>

        <Dialog
            open={openPreferences}
            onClose={() => {
                setOpenPreferences(false)
            }}
        >
            <Preferences onClose={() => {
                setOpenPreferences(false)
            }}/>
        </Dialog>

    </Stack>
}

export default ProfileDropdown
