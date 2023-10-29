import React, {useState} from 'react';
import {ClickAwayListener, ListItem, ListItemIcon, ListItemText, useTheme} from '@mui/material';

import {GroupItem} from '../../types/sidebar';
import { DashboardColors } from '../../ThemeOptions';

interface ItemProps {
    item: GroupItem;
}

const Item = (props: ItemProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const theme = useTheme()
    // const primaryContrastColor = theme.palette.getContrastText(DashboardColors.primary)

    return (
        <ClickAwayListener onClickAway={() => setIsHovered(false)}>
            <ListItem
                aria-label={props.item.areaLabel}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                secondaryAction={isHovered && props.item.itemMenu}
                onClick={() => props.item.onClick?.()}
                sx={{
                    'cursor': 'pointer',
                    '&:hover': {
                        // backgroundColor: theme.palette.action.hover,
                        backgroundColor: DashboardColors.background,
                        color: DashboardColors.primary,
                        borderRadius: '12px',
                        // margin: '0px 12px',
                    },
                    '&:active': {
                        backgroundColor: theme.palette.action.active,
                    },
                    height: '48px',
                }}
                color={DashboardColors.background}
            >
                {props.item.icon &&
                    <ListItemIcon
                        sx={{
                            color: isHovered? DashboardColors.primary : DashboardColors.background,
                            mr: '12px',
                            minWidth: 0
                        }}
                    >
                        {props.item.icon}
                    </ListItemIcon>
                }
                <ListItemText
                    sx={{
                        'marginRight': isHovered ? 0 : 4,
                    }}
                    primaryTypographyProps={{
                        sx: {
                            color: isHovered? DashboardColors.primary : DashboardColors.background,
                            fontWeight: 600,
                            fontSize: '16px',
                        }
                    }}
                    color={DashboardColors.background}
                    primary={props.item.display_name}
                />
            </ListItem>
        </ClickAwayListener>
    );
};

export default Item;
