import React from 'react';
import {ListItem, ListItemText, Typography, ListItemAvatar, Avatar, Box} from '@mui/material';


import {DashboardColors} from '../../ThemeOptions';
import useAuth from '../../hooks/useAuth';
import {stringAvatar} from '../rhs/rhs';

interface Props {
    postID: string;
    isBot: boolean;
    message: string;
    children?: React.ReactNode;
}

const Message = (props: Props) => {
    const {user} = useAuth();

    return (
        <ListItem
            key={props.postID}
                sx={{
                    backgroundColor: props.isBot ? DashboardColors.background : 'white' ,
                    pl: '40px',
                    pr: '40px',
                }}
            >
            <Box display='flex' flexDirection='row' alignItems={'flex-start'}>
                <Box display='flex' flexDirection='row' alignItems={'flex-start'}>
                    <ListItemAvatar>
                        {props.isBot ?
                            <Avatar alt='bot' src='/favicon-32x32.png'/>
                            :
                            <Avatar alt={user!.username} {...stringAvatar(user!)}/>
                        }
                    </ListItemAvatar>
                    <ListItemText
                        sx={{mt: '8px'}}
                        primary={
                            <Typography component="span" sx={{whiteSpace: 'pre-wrap'}}>
                                {props.message}
                            </Typography>
                        }
                    />
                </Box>
                {props.children}
            </Box>
        </ListItem>
    );
}

export default Message;

