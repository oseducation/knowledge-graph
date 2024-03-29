import React, {useState} from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {Box, Button, ButtonProps, Divider, List, Typography} from '@mui/material';
import {styled} from '@mui/material/styles';

import {InProgressNodesCategoryName, NextNodesCategoryName, SidebarGroup} from '../../types/sidebar';
import {Client} from '../../client/client';

import Item from './item';


interface GroupProps {
    group: SidebarGroup;
}

const Group = (props: GroupProps) => {
    const [collapsed, setCollapsed] = useState(props.group.collapsed);

    return (
        <Box
            color={'primary.contrastText'}
        >
            <HeaderButton
                variant='text'
                startIcon={collapsed ? <ChevronRightIcon/> : <ExpandMoreIcon/>}
                aria-label={props.group.display_name}
                onClick={() => {
                    // Currently InProgressNodes category and NextNodes category are automatically generated and
                    // not saved in the DB. So we can't yet save the collapse state for these categories.
                    if (props.group.id !== InProgressNodesCategoryName && props.group.id !== NextNodesCategoryName) {
                        Client.Sidebar().setMyCategoryCollapsed(props.group.id, !collapsed);
                    }
                    setCollapsed(!collapsed);
                }}
            >
                <Typography
                    width={'100%'}
                    fontSize={14}
                    fontWeight={600}
                >
                    {props.group.display_name}
                </Typography>
            </HeaderButton>
            {!collapsed &&
                <List dense={true}>
                    {props.group.items.map((item) =>
                        <div key={item.id || item.display_name}>
                            <Item item={item}/>
                            <Divider/>
                        </div>
                    )}
                </List>
            }
        </Box>
    );
};

export default Group;

const HeaderButton = styled(Button)<ButtonProps>(({theme}) => ({
    width: '100%',
    p: '6px 20p 6px 4px',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    display: 'flex',
    flex: '1 1 auto',
    alignItems: 'center',
    fontSize: '12px',
    fontWeight: '600',
    color: theme.palette.primary.contrastText,
    backgroundColor: 'transparent',
    textOverflow: 'ellipsis',

    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:active': {
        backgroundColor: theme.palette.action.active,
    },
}));

