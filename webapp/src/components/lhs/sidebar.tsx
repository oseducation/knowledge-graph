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
