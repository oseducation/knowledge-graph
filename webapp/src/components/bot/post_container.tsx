import React from 'react';
import {ListItem, ListItemAvatar, Avatar, Box, Icon} from '@mui/material';

import {DashboardColors} from '../../ThemeOptions';
import useAuth from '../../hooks/useAuth';
import {stringAvatar} from '../rhs/rhs';
import {personalities} from '../../types/tutor_personalities';

interface Props {
    isBot: boolean;
    children?: React.ReactNode;
    tutorPersonality?: string;
}

const PostContainer = (props: Props) => {
    const {user} = useAuth();

    const icon = getIcon(props.tutorPersonality);

    return (
        <ListItem
            sx={{
                backgroundColor: props.isBot ? DashboardColors.background : 'white' ,
                pl: {xs: '2px', sm: '10px', md: '20px', lg: '40px'},
                pr: {xs: '2px', sm: '10px', md: '20px', lg: '40px'},
            }}
        >
            <Box display='flex' flexDirection='row' alignItems={'flex-start'} flexGrow={1} minWidth={0}>
                <Box display='flex' flexDirection='row' alignItems={'flex-start'} justifyContent={'center'}>
                    <ListItemAvatar sx={{display: 'flex', justifyContent:'center'}}>
                        {props.isBot ?
                            icon
                            :
                            <Avatar alt={user!.username} {...stringAvatar(user!)}/>
                        }
                    </ListItemAvatar>
                </Box>
                {props.children}
            </Box>
        </ListItem>
    );
}

const getIcon = (tutorPersonality: string | undefined) => {
    let currentPersonalitySymbol = '👩‍🏫'
    for (let i = 0; i < personalities.length; i++) {
        if (personalities[i].id === tutorPersonality) {
            currentPersonalitySymbol = personalities[i].symbol;
            break
        }
    }
    return <Icon sx={{height:'100%'}}>{currentPersonalitySymbol}</Icon>
}

export default PostContainer;

