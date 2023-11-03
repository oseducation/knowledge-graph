import React from 'react';
import {Box} from '@mui/material';
import {useTranslation} from 'react-i18next';

import useAuth from '../../hooks/useAuth';
import {Client} from '../../client/client';
import {Post} from '../../types/posts';
import {NodeStatusStarted, NodeStatusUnseen, NodeWithResources} from '../../types/graph';
import Markdown from '../markdown';
import VideoPlayer from '../player';

import Message from './message';

const BOT_ID = 'aiTutorBotID01234567890123';

interface Props {
    node: NodeWithResources;
    post: Post;
}

const VideoMessage = (props: Props) => {
    const {t} = useTranslation();
    const {user} = useAuth();

    const message = `# Topic: ${props.node.name}\n\n ## Description: ${props.node.description}\n\n ${t("Here's some text on the topic:")}`;

    const onVideoStarted = (videoKey: string) => {
        if (user && user.id) {
            if (props.node.status === ''|| props.node.status === NodeStatusUnseen) {
                Client.Node().markAsStarted(props.node.id, user.id);
            }
            Client.Video().videoStarted(videoKey);
        }
    }

    const onVideoEnded = (videoKey: string) => {
        if (user && user.id) {
            if (props.node.status === '' || props.node.status === NodeStatusUnseen || props.node.status === NodeStatusStarted) {
                Client.Node().markAsWatched(props.node.id, user.id);
            }
            Client.Video().videoFinished(videoKey);
        }
    }

    return (
        <Message
            isBot={props.post.user_id === BOT_ID}
            message={props.post.message}
            postID={props.post.id}
        >
            <Box>
                <Markdown text={message}/>
                <VideoPlayer
                    videoKey={props.node.videos[0].key}
                    width={'100%'}
                    height={'100%'}
                    autoplay={true}
                    onVideoStarted={onVideoStarted}
                    onVideoEnded={onVideoEnded}
                />
            </Box>
        </Message>
    );
}

export default VideoMessage;
