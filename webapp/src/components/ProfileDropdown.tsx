import * as React from 'react';
import Button from '@mui/material/Button';
import PersonIcon from '@mui/icons-material/Person';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ProgressIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';

import Stack from '@mui/material/Stack';

import {useNavigate} from "react-router-dom";

import {ListItemIcon, ListItemText} from "@mui/material";

import useAuth from "../hooks/useAuth";

import {Client} from "../client/client";

const ProfileDropdown = () => {
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLButtonElement>(null);
    const {user, setUser} = useAuth()
    const navigate = useNavigate();

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event: Event | React.SyntheticEvent) => {
        if (
            anchorRef.current &&
            anchorRef.current.contains(event.target as HTMLElement)
        ) {
            return;
        }

        setOpen(false);
    };
    const handleProfile = (event: Event | React.SyntheticEvent) => {
        handleClose(event)
        navigate('/profile')
    };
    const handleLogout = (event: Event | React.SyntheticEvent) => {
        handleClose(event)
        Client.User().logout().then(() => {
            setUser?.(null);
            navigate('/login')
        });

    };
    const handleProgress = (event: Event | React.SyntheticEvent) => {
        handleClose(event)
        navigate('/')
    };

    function handleListKeyDown(event: React.KeyboardEvent) {
        if (event.key === 'Tab') {
            event.preventDefault();
            setOpen(false);
        } else if (event.key === 'Escape') {
            setOpen(false);
        }
    }

    // return focus to the button when we transitioned from !open -> open
    const prevOpen = React.useRef(open);
    React.useEffect(() => {
        if (prevOpen.current && !open) {
            anchorRef.current!.focus();
        }

        prevOpen.current = open;
    }, [open]);

    return (
        <Stack direction="row" spacing={2}>
            <div>
                <Button
                    ref={anchorRef}
                    id="composition-button"
                    aria-controls={open ? 'composition-menu' : undefined}
                    aria-expanded={open ? 'true' : undefined}
                    aria-haspopup="true"
                    onClick={handleToggle}
                    startIcon={<PersonIcon/>}
                    sx={{
                        border: '1px solid darkred',
                    }}
                >
                    {user?.username}
                </Button>
                <Popper
                    open={open}
                    anchorEl={anchorRef.current}
                    role={undefined}
                    placement="bottom-start"
                    transition
                    disablePortal
                >
                    {({TransitionProps, placement}) => (
                        <Grow
                            {...TransitionProps}
                            style={{
                                transformOrigin:
                                    placement === 'bottom-start' ? 'left top' : 'left bottom',
                            }}
                        >
                            <Paper>
                                <ClickAwayListener onClickAway={handleClose}>
                                    <MenuList
                                        autoFocusItem={open}
                                        id="composition-menu"
                                        aria-labelledby="composition-button"
                                        onKeyDown={handleListKeyDown}
                                    >
                                        <MenuItem onClick={handleProfile}>
                                            <ListItemIcon>
                                                <AccountCircleIcon/>
                                            </ListItemIcon>
                                            <ListItemText primary="Profile"/>

                                        </MenuItem>
                                        <MenuItem onClick={handleProgress}>
                                            <ListItemIcon>
                                                <ProgressIcon/>
                                            </ListItemIcon>
                                            <ListItemText primary="Progress"/>
                                        </MenuItem>
                                        <MenuItem onClick={handleLogout}>
                                            <ListItemIcon>
                                                <LogoutIcon/>
                                            </ListItemIcon>
                                            <ListItemText primary="Logout"/>
                                        </MenuItem>
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>
            </div>
        </Stack>
    );
}

export default ProfileDropdown
