import React, {useState} from 'react';
import {ListItem, ListItemIcon, ListItemText, useTheme} from '@mui/material';

interface DashboardLHSGroupProps {
    id: string;
    display_name: string;
    areaLabel: string;
    icon?: React.ReactNode;
    onClick: () => void;
    onHoverIcon?: React.ReactNode;
    secondaryOnHover?: React.ReactNode
}

const DashboardLHSGroup = (props: DashboardLHSGroupProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const theme = useTheme();

    return (
        <ListItem
            aria-label={props.areaLabel}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            secondaryAction={isHovered && props.secondaryOnHover}
            onClick={() => props.onClick()}
            sx={{
                'cursor': 'pointer',
                '&:hover': {
                    backgroundColor: theme.palette.background.default,
                    color: theme.palette.primary.main,
                    borderRadius: '12px',
                },
                '&:active': {
                    backgroundColor: theme.palette.action.active,
                },
                height: '48px',
            }}
            color={theme.palette.background.default}
        >
            {props.icon &&
                <ListItemIcon
                    sx={{
                        color: isHovered? theme.palette.primary.main : theme.palette.background.default,
                        mr: '12px',
                        minWidth: 0
                    }}
                >
                    {isHovered? props.onHoverIcon : props.icon}
                </ListItemIcon>
            }
            <ListItemText
                sx={{
                    'marginRight': isHovered ? 0 : 4,
                }}
                primaryTypographyProps={{
                    sx: {
                        color: isHovered? theme.palette.primary.main : theme.palette.background.default,
                        fontWeight: 600,
                        fontSize: '16px',
                    }
                }}
                color={theme.palette.background.default}
                primary={props.display_name}
            />
        </ListItem>
    )
}
export default DashboardLHSGroup;
