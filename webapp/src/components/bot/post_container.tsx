import React from 'react';
import {ListItem, ListItemAvatar, Avatar, Box} from '@mui/material';

import {DashboardColors} from '../../ThemeOptions';
import useAuth from '../../hooks/useAuth';
import {stringAvatar} from '../rhs/rhs';

interface Props {
    isBot: boolean;
    children?: React.ReactNode;
}

const PostContainer = (props: Props) => {
    const {user} = useAuth();

    return (
        <ListItem
            sx={{
                backgroundColor: props.isBot ? DashboardColors.background : 'white' ,
                pl: {xs: '2px', sm: '10px', md: '20px', lg: '40px'},
                pr: {xs: '2px', sm: '10px', md: '20px', lg: '40px'},
            }}
        >
            <Box display='flex' flexDirection='row' alignItems={'flex-start'} flexGrow={1}>
                <Box display='flex' flexDirection='row' alignItems={'flex-start'}>
                    <ListItemAvatar>
                        {props.isBot ?
                            <Avatar alt='bot' src='/favicon-32x32.png'/>
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

export default PostContainer;

