import React from 'react';
import {Box} from '@mui/material';

import {Question} from '../../types/graph';
import Markdown from '../markdown';
import QuestionChoices from '../bot/question_choices';

interface Props {
    question: Question;
    onRightChoice: () => void;
    onWrongChoice: () => void;
}

const QuizQuestion = (props: Props) => {
    return (
        <Box display={'flex'} flexDirection={'column'} alignItems={'flex-start'} width={'400px'} mt={6}>
            <Box display={'flex'} flexDirection={'column'}>
                <Markdown text={props.question.question}/>
                <QuestionChoices
                    choices={props.question.choices}
                    onRightChoice={props.onRightChoice}
                    onWrongChoice={props.onWrongChoice}
                    isLast={true}
                />
            </Box>
        </Box>
    );
}

export default QuizQuestion;

