import * as React from 'react';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ProgressIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import Menu from "@mui/material/Menu";
import {Avatar, Dialog, ListItemIcon, MenuItem, Stack} from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';
import {useTranslation} from 'react-i18next';
import {useNavigate} from "react-router-dom";

import {Client} from "../client/client";
import useAuth from "../hooks/useAuth";
import {DashboardColors} from '../ThemeOptions';

import Preferences from "./preferences";
import {stringAvatar} from './rhs/rhs';


const ProfileDropdown = () => {
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
    const {user, setUser} = useAuth()
    const navigate = useNavigate();
    const [openPreferences, setOpenPreferences] = React.useState(false);
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

    return (
        <Stack direction="row" spacing={2}>
            <Avatar
                alt={user!.username}
                {...stringAvatar(user!)}
                onClick={handleOpenUserMenu}
            />
            <Menu
                anchorEl={anchorElUser}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                keepMounted
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        bgcolor: DashboardColors.background,
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: DashboardColors.background,
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                {profileDestinations.map((destination) => (
                    <MenuItem
                        key={"profileMenu" + destination.displayName}
                        onClick={() => handleCloseUserMenu(destination.destination)}
                        sx={{color: DashboardColors.primary}}
                    >
                        <ListItemIcon sx={{color: DashboardColors.primary}}>
                            {destination.icon}
                        </ListItemIcon>
                        {destination.displayName}
                    </MenuItem>
                ))}
            </Menu>
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
    );
}

export default ProfileDropdown
