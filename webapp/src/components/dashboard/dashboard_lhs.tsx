import * as React from 'react';
import Box from '@mui/material/Box';
import {Divider, List, Typography} from "@mui/material";
import {useNavigate} from 'react-router-dom';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import MilitaryTechOutlinedIcon from '@mui/icons-material/MilitaryTechOutlined';

import {DashboardColors} from '../../ThemeOptions';
import {GroupItem} from '../../types/sidebar';
import {getLogo} from '../header';

import Item from './item';


const DashboardLHS = () =>{
    const navigate = useNavigate();
    const items = [{
        id: 'overview',
        display_name: 'Overview',
        icon: <DashboardOutlinedIcon fontSize='large'/>,
        onClick: () => navigate('/dashboard')
    }, {
        id: 'ai-tutor',
        display_name: 'AI Tutor',
        icon: <ChatBubbleOutlineOutlinedIcon fontSize='large'/>,
        onClick: () => navigate('/dashboard/ai-tutor')
    }, {
        id: 'graph',
        display_name: 'Topic Map',
        icon: <AccountTreeOutlinedIcon fontSize='large'/>,
        onClick: () => navigate('/dashboard/graph')
    }, {
        id: 'goals',
        display_name: 'Goals',
        icon: <RocketLaunchOutlinedIcon fontSize='large'/>,
        // onClick: () => navigate('/dashboard/goals')
    }, {
        id: 'badges',
        display_name: 'Badges',
        icon: <MilitaryTechOutlinedIcon fontSize='large'/>,
        // onClick: () => navigate('/dashboard/badges')
    }]

    return (
        <Box>
            <Box
                display={'flex'}
                flexDirection={'row'}
                alignItems={'center'}
                height={'68px'}
                color={DashboardColors.background}
                margin={'4px 16px'}
            >
                <Box mr={'16px'}>
                    {getLogo()}
                </Box>
                <Typography
                    width={'100%'}
                    fontSize={20}
                    fontWeight={600}
                >
                    {"Vitsi AI"}
                </Typography>
            </Box>
            <List dense={true}>
                {items.map((item) =>
                    <div key={item.id || item.display_name}>
                        <Item
                            item={item as GroupItem}
                        />
                    </div>
                )}
            </List>
            <Divider/>
        </Box>
    );
}

export default DashboardLHS;
