import React from 'react';
import {Box} from '@mui/material';

import {Post, PostTypeChatGPT, PostTypeFilledInByAction, PostTypeGoalFinish, PostTypeKarelJS, PostTypeTest, PostTypeText, PostTypeTopic, PostTypeVideo} from '../../types/posts';
import IDE from '../karel/ide';
import LinkFallback from '../link_fallback';
import VideoFallback from '../video_fallback';

import VideoMessage from './video_message';
import {BOT_ID} from './ai_tutor_chat';
import TestMessage from './test_message';
import PostContainer from './post_container';
import TextMessage from './text_message';
import GraphMessage from './graph_message';

interface Props {
    post: Post;
    isLast: boolean;
    scrollToBottom: () => void;
    nextNodeID: string;
    addScrollListener?: (a: ()=>void) => void;
    removeScrollListener?: (a: ()=>void) => void;
    isLastVideo?: boolean;
}

const PostComponent = (props: Props) => {
    let component = null;

    if (props.post.post_type === PostTypeVideo) {
        component = (
            <VideoFallback fallback={!props.isLastVideo} videoProps={props.post.props}>
                <VideoMessage
                    post={props.post}
                    isLast={props.isLast}
                    scrollToBottom={props.scrollToBottom}
                    addScrollListener={props.addScrollListener}
                    removeScrollListener={props.removeScrollListener}
                    isLastVideo={props.isLastVideo}
                />
            </VideoFallback>
        );
    } else if (props.post.post_type === '' ||
        // props.post.post_type === PostTypeTopic ||
        props.post.post_type === PostTypeText ||
        props.post.post_type === PostTypeFilledInByAction ||
        props.post.post_type === PostTypeChatGPT ||
        props.post.post_type === PostTypeGoalFinish ) {
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
            <LinkFallback fallback={!props.isLast} link={getKarelUrl(nodeID, nodeName)} text={''}>
                <Box sx={{height:'600px', width:{xs:'300px', sm:'400px', md:'700px', lg:'1000px'}}}>
                    <IDE
                        nodeName={nodeName}
                        nodeID={nodeID}
                        lang={'js'}
                        height='600px'
                    />
                </Box>
            </LinkFallback>
        )
    } else if (props.post.post_type === PostTypeTopic) {
        if (props.isLast) {
            component = (
                <GraphMessage
                    message={props.post.message}
                    currentNodeID={props.nextNodeID}
                    scrollToBottom={props.scrollToBottom}
                />
            );
        } else {
            component = (
                <TextMessage
                    shouldAnimate={props.isLast}
                    message={props.post.message}
                    scrollToBottom={props.scrollToBottom}
                />
            );
        }
    }

    return (
        <PostContainer
            isBot={props.post.user_id === BOT_ID}
            tutorPersonality={props.post.props?.tutor_personality || 'standard-tutor-personality'}
        >
            {component}
        </PostContainer>
    );
}

export default PostComponent;

const getKarelUrl = (nodeId: string, nodeName: string) => {
    const urlSearchParams = new URLSearchParams();
    urlSearchParams.append('nodeId', nodeId);
    urlSearchParams.append('nodeName', nodeName);
    return `/karel_js?${urlSearchParams.toString()}`
};
