import React from 'react';

import {Post, PostTypeVideo} from '../../types/posts';

import VideoMessage from './video_message';
import Message from './message';
import {BOT_ID} from './chat';

interface Props {
    post: Post;
    isLast: boolean;

}

const PostComponent = (props: Props) => {
    let component = null;

    if (props.post.post_type === PostTypeVideo) {
        component = (
            <VideoMessage post={props.post} isLast={props.isLast}/>
        );
    } else if (props.post.post_type === '') {
        component = (
            <Message
                postID={props.post.id}
                isBot={props.post.user_id === BOT_ID}
                message={props.post.message}
            />
        );
    }

    return component;
}

export default PostComponent;

