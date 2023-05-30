import React, {useState} from 'react';
import {IconButton, ListItemIcon, ListItemText, Menu, MenuItem} from '@mui/material';
import {CheckCircleOutline, StarBorderOutlined} from '@mui/icons-material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import {Client} from '../client/client';

type NodeDropDownMenuProps = {
    userID: string;
    nodeID: string;
    onReload:() => void;
}

const NodeDropDownMenu = (props: NodeDropDownMenuProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const markAsKnown = () => {
        if (props.userID) {
            Client.Node().markAsKnown(props.nodeID, props.userID).then(() => {
                props.onReload();
            });
        }
    }

    return(
        <>
            <IconButton edge="end" onClick={handleClick}>
                <MoreVertIcon/>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
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
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{horizontal: 'right', vertical: 'top'}}
                anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
            >
                <MenuItem>
                    <ListItemIcon>
                        <StarBorderOutlined fontSize="small"/>
                    </ListItemIcon>
                    <ListItemText>
                        Favorite
                    </ListItemText>
                </MenuItem>
                <MenuItem>
                    <ListItemIcon>
                        <CheckCircleOutline fontSize="small"/>
                    </ListItemIcon>
                    <ListItemText onClick={() => markAsKnown()}>
                        I know this
                    </ListItemText>
                </MenuItem>
            </Menu>
        </>
    )
}

export default NodeDropDownMenu;
