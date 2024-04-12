import React from 'react';
import {Box, Typography, MenuItem} from '@mui/material';
import {styled, alpha} from '@mui/material/styles';
import Menu, {MenuProps} from '@mui/material/Menu';
import Icon from '@mui/material/Icon';

import useAuth from '../../hooks/useAuth';
import {personalities} from '../../types/tutor_personalities';
import {Client} from '../../client/client';


const BotComponent = () => {
    const {user, preferences, setPreferences} = useAuth()
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    let currentPersonalitySymbol = '👩‍🏫'
    for (let i = 0; i < personalities.length; i++) {
        if (personalities[i].id === preferences?.tutor_personality) {
            currentPersonalitySymbol = personalities[i].symbol;
            break
        }
    }

    return (
        <Box
            aria-owns={open ? 'mouse-over-popover' : undefined}
            aria-haspopup="true"
            onMouseEnter={handleOpen}
            onMouseLeave={handleClose}
        >
            <Icon sx={{height:'100%'}}>{currentPersonalitySymbol}</Icon>
            <StyledMenu
                // id="demo-customized-menu"
                // MenuListProps={{
                //     'aria-labelledby': 'demo-customized-button',
                // }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                {personalities.map((personality) => (
                    <MenuItem
                        key={personality.id}
                        disableRipple
                        onClick={() => {
                            Client.User().saveMyPreferences([{key: 'tutor_personality', user_id: user!.id, value: personality.id}])
                                .then(() => {
                                    if (setPreferences && preferences) {
                                        setPreferences({...preferences, tutor_personality: personality.id});
                                    }
                                    handleClose();
                                })
                                .catch((err) => {
                                    console.log('error', err)
                                    handleClose();
                                })
                        }}
                    >
                        <Box display={'flex'} flexDirection={'row'} alignItems={'baseline'}>
                            <Icon sx={{height:'100%'}}>{personality.symbol}</Icon>
                            <Typography variant={'body1'} sx={{ml: 1}}>
                                {personality.name}
                            </Typography>
                        </Box>
                    </MenuItem>
                ))}
            </StyledMenu>
        </Box>
    );
}

export default BotComponent;


const StyledMenu = styled((props: MenuProps) => (
    <Menu
        elevation={0}
        anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
        }}
        transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
        }}
        {...props}
    />
))(({theme}) => ({
    '& .MuiPaper-root': {
        borderRadius: 6,
        marginTop: theme.spacing(1),
        minWidth: 180,
        color: theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
        boxShadow: 'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
        '& .MuiMenu-list': {
            padding: '4px 0',
        },
        '& .MuiMenuItem-root': {
            '& .MuiSvgIcon-root': {
                fontSize: 18,
                color: theme.palette.text.secondary,
                marginRight: theme.spacing(1.5),
            },
            '&:active': {
                backgroundColor: alpha(
                    theme.palette.primary.main,
                    theme.palette.action.selectedOpacity,
                ),
            },
        },
    },
}));
