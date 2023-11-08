import React from 'react';

import {Post, PostTypeFilledInByAction, PostTypeTest, PostTypeText, PostTypeTopic, PostTypeVideo} from '../../types/posts';

import VideoMessage from './video_message';
import {BOT_ID} from './chat';
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
            <VideoMessage
                post={props.post}
                isLast={props.isLast}
                scrollToBottom={props.scrollToBottom}
            />
        );
    } else if (props.post.post_type === '' ||
        props.post.post_type === PostTypeTopic ||
        props.post.post_type === PostTypeText ||
        props.post.post_type === PostTypeFilledInByAction) {
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
    }

    return (
        <PostContainer isBot={props.post.user_id === BOT_ID}>
            {component}
        </PostContainer>
    );
}

export default PostComponent;

