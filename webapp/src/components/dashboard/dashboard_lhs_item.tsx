import React, {useState} from 'react';
import {ClickAwayListener, IconButton, ListItem, ListItemIcon, ListItemText, Menu, MenuItem, useTheme} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import DeleteIcon from '@mui/icons-material/Delete';

import useAuth from '../../hooks/useAuth';
import {Client} from '../../client/client';
import useLayout from '../../hooks/useLayout';

interface DashboardLHSItemProps {
    id: string;
    display_name: string;
    areaLabel: string;
    icon?: React.ReactNode;
    onClick: () => void;
    onHoverIcon?: React.ReactNode;
}

const DashboardLHSItem = (props: DashboardLHSItemProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const {userNotes, setUserNotes} = useAuth();
    const {setRHSNoteID} = useLayout();

    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
        setIsHovered(false);
    };

    const onDelete = () => {
        Client.User().DeleteNote(props.id).then(() => {
            setUserNotes(userNotes.filter((note) => note.id !== props.id));
            setRHSNoteID(null);
        });
        handleClose();
    }

    return (
        <ListItem
            dense={true}
            aria-label={props.areaLabel}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false)
                setAnchorEl(null);
            }}
            secondaryAction={isHovered &&
                <IconButton edge="end" onClick={handleClick}>
                    <MoreVertIcon fontSize='small'/>
                </IconButton>
            }
            onClick={() => props.onClick()}
            sx={{
                'cursor': 'pointer',
                backgroundColor: isHovered? theme.palette.background.default : theme.palette.primary.main,
                color: isHovered ? theme.palette.primary.main : theme.palette.background.default,
                borderRadius: isHovered ? '12px' : '0px',
                '&:active': {
                    backgroundColor: theme.palette.action.active,
                },
                pl: 4,
            }}
        >
            {props.icon &&
                <ListItemIcon
                    sx={{
                        mr: '4px',
                        minWidth: 0
                    }}
                >
                    {isHovered? props.onHoverIcon : props.icon}
                </ListItemIcon>
            }
            <ListItemText
                sx={{'marginRight': isHovered ? 0 : 4}}
                color={theme.palette.background.default}
                primary={props.display_name}
            />
            <ClickAwayListener onClickAway={()=>{handleClose()}}>
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    // onClick={handleClose}
                    PaperProps={{
                        elevation: 0,
                        sx: {
                            overflow: 'visible',
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
                                bgcolor: 'background.default',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                            },
                            bgcolor: theme.palette.background.default,
                            color: theme.palette.primary.main,
                        },
                    }}
                    transformOrigin={{horizontal: 'right', vertical: 'top'}}
                    anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                >
                    <MenuItem>
                        <ListItemIcon color={theme.palette.primary.main}>
                            <DriveFileRenameOutlineIcon fontSize="small"/>
                        </ListItemIcon>
                        <ListItemText>
                            Rename
                        </ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => onDelete()}>
                        <ListItemIcon color={theme.palette.primary.main}>
                            <DeleteIcon fontSize="small"/>
                        </ListItemIcon>
                        <ListItemText>
                            Delete
                        </ListItemText>
                    </MenuItem>
                </Menu>
            </ClickAwayListener>
        </ListItem>
    );
};

export default DashboardLHSItem;
