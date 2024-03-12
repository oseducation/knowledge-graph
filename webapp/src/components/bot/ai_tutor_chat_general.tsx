import React, {useState, useRef, useEffect} from 'react';
import {List, Box} from '@mui/material';
import {styled} from '@mui/system';
import {useParams} from 'react-router-dom';

import {DashboardColors} from '../../ThemeOptions';
import {Client} from '../../client/client';
import {Post} from '../../types/posts';

import PostComponent from './post_component';
import {BOT_ID} from './ai_tutor_chat';

const staticHeight = `calc(100vh - (64px))`;

const AITutorChatGeneral = () => {
    const {userID} = useParams<{userID: string}>();
    if (!userID) {
        return null;
    }
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const locationID = `${userID}_${BOT_ID}`
    const [posts, setPosts] = useState<Post[]>([]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView();
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            scrollToBottom();
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        Client.Post().getPosts(locationID, false).then((retPosts) => {
            setPosts(retPosts);
        });
    }, [])

    if (!posts || posts.length === 0) {
        return (
            <div>
                no posts
            </div>
        );

    }

    return (
        <ChatContainer>
            <MessageList>
                {posts && posts.map((post) =>
                    <PostComponent
                        key={post.id}
                        post={post}
                        isLast={false}
                        scrollToBottom={scrollToBottom}
                        nextNodeID={''}
                    />
                )}
                <div ref={messagesEndRef}/>
            </MessageList>
        </ChatContainer>
    );
}

export default AITutorChatGeneral;

const ChatContainer = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    height: staticHeight,
});

const MessageList = styled(List)({
    flex: 1,
    overflow: 'auto',
    // padding: '20px',
    scrollbarColor: `${DashboardColors.primary} ${DashboardColors.background}`,
    scrollbarWidth: 'thin',
    "&::-webkit-scrollbar": {
        width: '8px',
        backgroundColor: DashboardColors.background,
    },
    "&::-webkit-scrollbar-thumb": {
        borderRadius: '10px',
        backgroundColor: DashboardColors.primary,
    },
});
