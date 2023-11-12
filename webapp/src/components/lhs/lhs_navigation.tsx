import {Box} from '@mui/material';
import React from 'react';

import {InProgressNodesCategoryName, NextNodesCategoryName, SidebarGroup} from '../../types/sidebar';

import Sidebar from './sidebar';


interface LHSProps {
    groups: SidebarGroup[];
    header?: React.ReactNode;
}

const LHSNavigation = (props: LHSProps) => {
    let groups = props.groups;
    if (!props.groups || props.groups.length === 0) {
        const inProgressGroup = {
            collapsed: false,
            display_name: "Topics In Progress",
            id: InProgressNodesCategoryName,
            items: []
        } as SidebarGroup;

        const nextGroup = {
            collapsed: false,
            display_name: "Next Topics",
            id: NextNodesCategoryName,
            items: []
        } as SidebarGroup;

        groups = [inProgressGroup, nextGroup];
    }

    return (
        <Box
            id='groups'
            width={240}
            sx={{
                flexDirection: 'column',
                height: '100%',
                direction: 'column',
                bgcolor: 'primary.main',
            }}
        >
            <Sidebar
                groups={groups}
                header={props.header}
            />
        </Box>
    );
};

export default LHSNavigation;
