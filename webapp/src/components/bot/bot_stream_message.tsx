import React, { useEffect } from 'react';
import {Typography} from '@mui/material';

import Markdown from '../markdown';

import PostContainer from './post_container';

interface Props {
    message: string;
    tutorPersonality: string;
    scrollToBottom: () => void;
}

const BotStreamMessage = (props: Props) => {
    useEffect(() => {
        props.scrollToBottom();
    }, [props.message]);

    const component = (
        <PostContainer isBot={true} tutorPersonality={props.tutorPersonality}>
            <Typography component="span">
                <Markdown text={props.message + '⬤'}/>
            </Typography>
        </PostContainer>
    )

    return component;
}

export default BotStreamMessage;
