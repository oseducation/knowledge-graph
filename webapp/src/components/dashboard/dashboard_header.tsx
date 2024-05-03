import React from 'react';
import {Badge, BadgeProps, Box, IconButton, styled} from '@mui/material';
// import {useLocation} from 'react-router-dom';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuIcon from '@mui/icons-material/Menu';

import {DashboardColors} from '../../ThemeOptions';
// import useGraph from '../../hooks/useGraph';
import useLayout from '../../hooks/useLayout';
import ProfileDropdown from '../profile_dropdown';

import SearchBar from './search_bar';

const DashboardHeader = () => {
    // const location = useLocation();
    // const {graph, setParentID} = useGraph();
    const {drawerOpen, setDrawerOpen} = useLayout();

    // const backButton = graph && (graph.nodes.length === 0 || graph.nodes.length > 0 && graph.nodes[0].parent_id !== '') && location.pathname.includes('/dashboard/graph');

    const handleDrawerToggle = () => {
        setDrawerOpen?.(!drawerOpen);
    };

    return (
        <Box sx={{width:'100%'}} display={'flex'} flexDirection={'row'} alignItems={'center'} alignContent={'center'} justifyContent={'space-between'}>
            <Box display={'flex'} flexDirection={'row'} alignItems={'baseline'} alignContent={'center'}>
                <IconButton
                    color="primary"
                    aria-label="open drawer"
                    onClick={handleDrawerToggle}
                    sx={{
                        display: {xs: 'block', sm: 'block', md: 'block', lg: 'none'},
                    }}
                >
                    <MenuIcon/>
                </IconButton>
                {/* {backButton &&
                    <IconButton
                        color="primary"
                        aria-label="back"
                        onClick={() => setParentID('')}
                    >
                        <ArrowBackIcon/>
                    </IconButton>
                } */}
            </Box>

            <Box mr={'20px'} display={'flex'} flexDirection={'row'} alignItems={'center'} alignContent={'center'}>
                <SearchBar/>
                <IconButton sx={{xs: {m:'0px 1px'}, sm:{m: '0px, 1px'}, md:{m: '0px 20px'}}}>
                    <StyledBadge badgeContent={0}>
                        <NotificationsOutlinedIcon sx={{color:DashboardColors.primary}}/>
                    </StyledBadge>
                </IconButton>
                <ProfileDropdown/>
            </Box>
        </Box>
    );
}

export default DashboardHeader;

const StyledBadge = styled(Badge)<BadgeProps>(() => ({
    '& .MuiBadge-badge': {
        color: DashboardColors.background,
        backgroundColor: DashboardColors.alert,
    },
}));
