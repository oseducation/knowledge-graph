import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {ListItem, ListItemText, ClickAwayListener, ListItemIcon, useTheme} from '@mui/material';

import {GroupItem} from '../../types/sidebar';

interface ItemProps {
    item: GroupItem;
}

const Item = (props: ItemProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme()

    return (
        <ClickAwayListener onClickAway={() => setIsHovered(false)}>
            <ListItem
                aria-label={props.item.areaLabel}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                secondaryAction={isHovered && props.item.itemMenu}
                onDoubleClick={() => navigate(`/nodes/${props.item.link}`)}
                onClick={() => props.item.onClick?.()}
                sx={{
                    'cursor': 'pointer',
                    '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                    },
                    '&:active': {
                        backgroundColor: theme.palette.action.active,
                    },
                }}
            >
                {props.item.icon && <ListItemIcon sx={{color: 'white', minWidth: 0, margin:'0px 4px'}}>{props.item.icon}</ListItemIcon>}
                <ListItemText secondaryTypographyProps={{color: 'white'}} primary={props.item.display_name} secondary={props.item.secondary}/>
            </ListItem>
        </ClickAwayListener>
    );
};

export default Item;
