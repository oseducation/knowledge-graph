import React from 'react';
import {Box} from '@mui/material';

import {Post, PostTypeChatGPT, PostTypeFilledInByAction, PostTypeKarelJS, PostTypeTest, PostTypeText, PostTypeTopic, PostTypeVideo} from '../../types/posts';
import IDE from '../karel/ide';

import MessageLinkFallback from '../message_link_fallback';

import {getVideoUrl, getKarelUrl} from '../../utils';

import VideoMessage from './video_message';
import {BOT_ID} from './ai_tutor_chat';
import TestMessage from './test_message';
import PostContainer from './post_container';
import TextMessage from './text_message';

interface Props {
    post: Post;
    isLast: boolean;
    scrollToBottom: () => void;
}

const PostComponent = (props: Props) => {
    let component = null;

    if (props.post.post_type === PostTypeVideo) {
        component = (
            <MessageLinkFallback fallback={!props.isLast} link={getVideoUrl(props.post.props.video_key)}>
                <VideoMessage
                    post={props.post}
                    isLast={props.isLast}
                    scrollToBottom={props.scrollToBottom}
                />
            </MessageLinkFallback>
        );
    } else if (props.post.post_type === '' ||
        props.post.post_type === PostTypeTopic ||
        props.post.post_type === PostTypeText ||
        props.post.post_type === PostTypeFilledInByAction ||
        props.post.post_type === PostTypeChatGPT) {
        component = (
            <TextMessage
                shouldAnimate={props.isLast}
                message={props.post.message}
                scrollToBottom={props.scrollToBottom}
            />
        );
    } else if (props.post.post_type === PostTypeTest) {
        component = (
            <TestMessage
                post={props.post}
                isLast={props.isLast}
                scrollToBottom={props.scrollToBottom}
            />
        );
    } else if (props.post.post_type === PostTypeKarelJS) {
        const nodeID = props.post.props.node_id;
        const nodeName = props.post.props.node_name;
        component = (
            <MessageLinkFallback fallback={!props.isLast} link={getKarelUrl(nodeID, nodeName)}>
                <Box sx={{height:'600px', width:{xs:'300px', sm:'400px', md:'700px', lg:'1000px'}}}>
                    <IDE
                        nodeName={nodeName}
                        nodeID={nodeID}
                        lang={'js'}
                        height='600px'
                    />
                </Box>
            </MessageLinkFallback>
        )
    }

    return (
        <PostContainer isBot={props.post.user_id === BOT_ID}>
            {component}
        </PostContainer>
    );
}

export default PostComponent;

