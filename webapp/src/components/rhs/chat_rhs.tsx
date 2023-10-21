import {List, ListItem, ListItemText, Typography,Box, ListItemAvatar, Avatar} from '@mui/material';
import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {Post} from '../../types/posts';
import {stringAvatar} from '../rhs/rhs';
import { Client } from '../../client/client';
import useAuth from '../../hooks/useAuth';
import Markdown from '../markdown';

import PostInput from './post_input';
import { Analytics } from '../../analytics';


interface Props {
    locationID: string;
}

const ChatRHS = (props: Props) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const {t} = useTranslation();
    const {user} = useAuth();
    const messageEndRef = useRef<HTMLDivElement | null>(null);


    const loadPosts = () => {
        Client.Post().getPosts(props.locationID).then((data) => {
            setPosts(data);
        });
    }

    useEffect(() => {
        loadPosts();
    }, [props.locationID]);

    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({behavior: 'smooth'});
        }
    }, [posts]);

    const handleSend = (message: string) => {
        Client.Post().savePost(message, props.locationID).then((post) => {
            setPosts([...posts, {
                id: post.id,
                message: post.message,
                user: user!
            }]);
            Analytics.messagePosted({location_id: props.locationID, user_id: user!.id});
        });
    }

    return (
        <Box
            height='100%'
            style={{
                maxWidth: '400px',
                margin: '0 auto',
                borderLeft: '1px solid #d9d9e3',
            }}
        >
            <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                {t("Topic Chat")}
            </Typography>
            <List style={{overflowY: 'auto', flexGrow: 1}}>
                {posts.map((post, index) => {
                    return (
                        <ListItem key={index} alignItems="flex-start">
                            <ListItemAvatar>
                                <Avatar key={post.user.id} alt={post.user.username} {...stringAvatar(post.user)}/>
                            </ListItemAvatar>
                            <ListItemText
                                primary={post.user.username}
                                secondary={<Markdown text={post.message}/>}
                            />
                        </ListItem>
                    );
                })}
            </List>
            <div ref={messageEndRef} />
            <PostInput onInputSend={handleSend}/>
        </Box>
    );
};

export default ChatRHS;
