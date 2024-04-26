import React from 'react';
import {Typography} from '@mui/material';

import Markdown from '../markdown';

import useMessageReveal from './use_message_reveal';

interface Props {
    shouldAnimate: boolean;
    message: string;
    scrollToBottom: () => void;
}

const TextMessage = (props: Props) => {
    const {message} = useMessageReveal(props.message, props.shouldAnimate, props.scrollToBottom);

    return (
        <Typography component="span">
            <Markdown text={message}/>
        </Typography>
    );
}

export default TextMessage;

