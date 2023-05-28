import {Box} from '@mui/material';
import React from 'react';

import { SidebarGroup } from '../../types/sidebar';

import Group from './group';


interface SidebarProps {
    groups: Array<SidebarGroup>;
}

const Sidebar = (props: SidebarProps) => {
    return (
        <Box
            id='groups'
            display={'flex'}
            flexDirection={'column'}
            width={240}
            height={'100%'}
            bgcolor={'primary.dark'}
            borderRight={'1px solid'}
            borderColor={'primary.light'}
            sx={{
                overflow:'hidden',
                overflowY:'scroll',
                '&::-webkit-scrollbar': {
                    width: '0.4em',
                },
                '&::-webkit-scrollbar-track': {
                    boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
                    webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)'
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0,0,0,.1)',
                }
            }}
        >
            {props.groups.map((group) => {
                return (
                    <Group
                        key={group.id}
                        group={group}
                    />
                );
            })}
        </Box>
    );
};

export default Sidebar;
