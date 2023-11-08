import React from 'react';
import {Box} from '@mui/material';

import {Post, PostTypeTest} from '../../types/posts';
import Markdown from '../markdown';

import QuestionChoices from './question_choices';
import useMessageReveal from './use_message_reveal';

interface Props {
    post: Post;
    isLast: boolean;
    scrollToBottom: () => void;
}

const TestMessage = (props: Props) => {
    const choices = props.post.props.test_choices;
    const {message} = useMessageReveal(props.post.message, props.isLast, props.scrollToBottom);

    if (props.post.post_type !== PostTypeTest) {
        return null;
    }

    return (
        <Box display={'flex'} flexDirection={'column'}>
            <Markdown text={message}/>
            <QuestionChoices choices={choices}/>
        </Box>
    );
}

export default TestMessage;

