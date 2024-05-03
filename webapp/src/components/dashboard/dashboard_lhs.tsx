import React, {useState} from 'react';
import Box from '@mui/material/Box';
import {Button, List, Typography} from "@mui/material";
import {useNavigate} from 'react-router-dom';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
// import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
// import MilitaryTechOutlinedIcon from '@mui/icons-material/MilitaryTechOutlined';
import BoltIcon from '@mui/icons-material/Bolt';

import {DashboardColors} from '../../ThemeOptions';
import {getLogo} from '../header';
import useAuth from '../../hooks/useAuth';
import UpgradeModal from '../pricing/upgrade_modal';

import DashboardLHSGroup from './dashboard_lhs_group';
import LHSNotes from './notes_lhs';


const DashboardLHS = () =>{
    const navigate = useNavigate();
    const {user} = useAuth();
    const [open, setOpen] = useState(false);

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
    }
    // , {
    //     id: 'goals',
    //     display_name: 'Goals',
    //     icon: <RocketLaunchOutlinedIcon fontSize='large'/>,
    //     onClick: () => navigate('/dashboard/goals')
    // }, {
    //     id: 'badges',
    //     display_name: 'Badges',
    //     icon: <MilitaryTechOutlinedIcon fontSize='large'/>,
    //     onClick: () => navigate('/dashboard/badges')
    // }
    ]

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
                    <div key={item.id}>
                        <DashboardLHSGroup
                            id={item.id}
                            display_name={item.display_name}
                            areaLabel={item.display_name}
                            icon={item.icon}
                            onClick={item.onClick}
                        />
                    </div>
                )}
                {/* <LHSNotes/> */}
            </List>
            {user && user.role === 'user' &&
                <>
                    <Button
                        variant={'outlined'}
                        onClick={() => setOpen(true)}
                        sx={{
                            bottom: 0,
                            position: 'absolute',
                            margin: '16px',
                            width: '208px',
                            bgcolor: DashboardColors.background,
                            fontWeight: 700,
                            fontSize: '16px',
                            '&:hover': {
                                backgroundColor: DashboardColors.primary,
                                color: DashboardColors.background,
                            },
                        }}
                        startIcon={<BoltIcon/>}
                    >
                        {"Upgrade"}
                    </Button>
                    <UpgradeModal open={open} onClose={() => setOpen(false)}/>
                </>
            }
        </Box>
    );
}

export default DashboardLHS;
