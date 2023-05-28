import {Box} from '@mui/material';
import React from 'react';

import {InProgressNodesCategoryName, NextNodesCategoryName, SidebarGroup} from '../../types/sidebar';

import Sidebar from './sidebar';


interface LHSProps {
    groups: SidebarGroup[];
}

const LHSNavigation = (props: LHSProps) => {
    let groups = props.groups;
    if (!props.groups || props.groups.length === 0) {
        const inProgressGroup = {
            collapsed: false,
            display_name: "Nodes In Progress",
            id: InProgressNodesCategoryName,
            items: []
        } as SidebarGroup;

        const nextGroup = {
            collapsed: false,
            display_name: "Next Nodes",
            id: NextNodesCategoryName,
            items: []
        } as SidebarGroup;

        groups = [inProgressGroup, nextGroup];
    }

    return (
        <Box
            width={240}
            height='100%'
            display='flex'
            flexDirection='column'
        >
            <Sidebar
                groups={groups}
            />
        </Box>
    );
};

export default LHSNavigation;
