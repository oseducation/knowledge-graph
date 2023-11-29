import React, {useState} from 'react';
import {Avatar, Badge, BadgeProps, Box, IconButton, ListItemIcon, Menu, MenuItem, styled} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ProgressIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import {DashboardColors} from '../../ThemeOptions';
import useAuth from '../../hooks/useAuth';
import {stringAvatar} from '../rhs/rhs';
import useGraph from '../../hooks/useGraph';
import {Spacer} from '../header';

import SearchBar from './search_bar';

const DashboardHeader = () => {
    const {user} = useAuth();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {graph, setParentID} = useGraph();

    const backButton = graph && (graph.nodes.length === 0 || graph.nodes.length > 0 && graph.nodes[0].parent_id !== '');

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const profileDestinations = [
        {onClick: () => navigate('/profile'), displayName: t('Profile'), icon: <AccountCircleIcon/>},
        {onClick: () => navigate('/preferences'), displayName: t('Preferences'), icon: <SettingsIcon/>},
        {onClick: () => navigate('/'), displayName: t('Progress'), icon: <ProgressIcon/>},
        {onClick: () => navigate('/logout'), displayName: t('Logout'), icon: <LogoutIcon/>}
    ]

    return (
        <>
            {backButton &&
                <IconButton
                    color="primary"
                    aria-label="back"
                    onClick={() => setParentID('')}
                >
                    <ArrowBackIcon/>
                </IconButton>
            }
            <Spacer/>

            <Box mr={'20px'} display={'flex'} flexDirection={'row'} alignItems={'center'} alignContent={'center'}>
                <SearchBar/>
                <IconButton sx={{m: '20px'}}>
                    <StyledBadge badgeContent={5}>
                        <NotificationsOutlinedIcon sx={{color:DashboardColors.primary}}/>
                    </StyledBadge>
                </IconButton>
                <Avatar
                    alt={user!.username}
                    {...stringAvatar(user!)}
                    onClick={handleClick}
                />
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
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
                            onClick={() => destination.onClick?.()}
                            sx={{color: DashboardColors.primary}}
                        >
                            <ListItemIcon sx={{color: DashboardColors.primary}}>
                                {destination.icon}
                            </ListItemIcon>
                            {destination.displayName}
                        </MenuItem>
                    ))}
                </Menu>
            </Box>
        </>
    );
}

export default DashboardHeader;

const StyledBadge = styled(Badge)<BadgeProps>(() => ({
    '& .MuiBadge-badge': {
        color: DashboardColors.background,
        backgroundColor: DashboardColors.alert,
    },
}));
