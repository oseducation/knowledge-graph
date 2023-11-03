import React, {useState, useEffect} from 'react';
import {Box} from '@mui/material';
import {useTranslation} from 'react-i18next';

import useAuth from '../../hooks/useAuth';
import {Client} from '../../client/client';
import {Post, PostTypeVideo} from '../../types/posts';
import {NodeStatusStarted, NodeStatusUnseen, NodeWithResources} from '../../types/graph';
import Markdown from '../markdown';
import VideoPlayer from '../player';

import {BOT_ID} from './chat';
import Message from './message';

interface Props {
    post: Post;
    isLast: boolean;
}

const VideoMessage = (props: Props) => {
    const {t} = useTranslation();
    const {user} = useAuth();
    const nodeID = props.post.props.node_id;
    const videoIndex = props.post.props.video_index;
    const [node, setNode] = useState<NodeWithResources | null>(null);
    const [message, setMessage] = useState<string>('');


    if (props.post.post_type !== PostTypeVideo) {
        return null;
    }

    useEffect(() => {
        Client.Node().get(nodeID).then((node) => {
            setNode(node);
        });
    }, []);


    useEffect(() => {
        if (node === null) {
            return;
        }
        if (node && node.videos.length <= videoIndex) {
            return;
        }
        const endMessage = `## Topic: ${node.name}\n\n ### Description: ${node.description}\n\n ${t("Here's the video on the topic:")}`;

        if (props.isLast){
            revealBotMessage(endMessage);
        } else{
            setMessage(endMessage);
        }
    }, [props.post, node]);

    if (node === null) {
        return <div>loading topic...</div>
    }

    if (node && node.videos.length <= videoIndex) {
        return <div>can&apos;t show this video...</div>
    }

    const onVideoStarted = (videoKey: string) => {
        if (user && user.id) {
            if (node.status === ''|| node.status === NodeStatusUnseen) {
                Client.Node().markAsStarted(node.id, user.id);
            }
            Client.Video().videoStarted(videoKey);
        }
    }

    const onVideoEnded = (videoKey: string) => {
        if (user && user.id) {
            if (node.status === '' || node.status === NodeStatusUnseen || node.status === NodeStatusStarted) {
                Client.Node().markAsWatched(node.id, user.id);
            }
            Client.Video().videoFinished(videoKey);
        }
    }

    const revealBotMessage = (endMessage: string) => {
        let index = 0;
        const interval = setInterval(() => {
            setMessage(endMessage.slice(0, index + 1));
            index += 1;

            if (index === endMessage.length) {
                clearInterval(interval);
            }
        }, 50); // Adjust the speed as needed
    };

    return (
        <Message
            isBot={props.post.user_id === BOT_ID}
            message={''}
            postID={props.post.id}
        >
            <Box display={'flex'} flexDirection={'column'}>
                <Markdown text={message}/>
                <VideoPlayer
                    videoKey={node.videos[videoIndex].key}
                    width={'100%'}
                    height={'600px'}
                    autoplay={false}
                    onVideoStarted={onVideoStarted}
                    onVideoEnded={onVideoEnded}
                />
            </Box>
        </Message>
    );
}

export default VideoMessage;
