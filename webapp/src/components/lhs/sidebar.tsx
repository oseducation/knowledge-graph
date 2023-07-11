import {Box} from '@mui/material';
import React from 'react';

import {SidebarGroup} from '../../types/sidebar';

import Group from './group';


interface SidebarProps {
    groups: Array<SidebarGroup>;
    header?: React.ReactNode;
}

const Sidebar = (props: SidebarProps) => {
    return (
        <Box
            id='groups'
            borderRight={'1px solid'}
            borderColor={'primary.light'}
            sx={{
                direction: 'column',
                flexDirection: 'column',
                borderColor: 'primary.light',
                borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                bgcolor: 'primary.dark',
            }}
        >
            {props.header}
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
