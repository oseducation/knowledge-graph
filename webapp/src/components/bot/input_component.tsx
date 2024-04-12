import React, {useState} from 'react';
import {Paper, IconButton, TextareaAutosize} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import {styled} from '@mui/system';

import {DashboardColors} from '../../ThemeOptions';

interface Props {
    handleSend: (input: string) => Promise<void>;
}

const InputComponent = (props: Props) => {
    const [input, setInput] = useState('');

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.ctrlKey || e.metaKey || e.shiftKey) && e.key === 'Enter') {
            e.preventDefault();
            setInput(input + '\n');
        } else if (e.key === 'Enter') {
            props.handleSend(input).then(() => setInput(''));
            e.preventDefault();
        }
    }

    return (
        <MessageInputContainer>
            <MessageInput
                placeholder="Type a message"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
            />
            <IconButton
                onClick={() => {
                    props.handleSend(input).then(() => setInput(''));
                }}
                sx={{color:DashboardColors.primary}}
                disabled={input.trim() === ''}
            >
                <SendIcon/>
            </IconButton>
        </MessageInputContainer>
    )
}

const MessageInputContainer = styled(Paper)({
    display: 'flex',
    padding: '2px 4px',
    alignItems: 'center',
    margin: '20px',
    width: '100%',
});

const MessageInput = styled(TextareaAutosize)({
    marginLeft: 8,
    flex: 1,
    maxHeight: '200px',
    height: '56px',
    overflowY: 'hidden',
    width: '100%',
    border: '0 solid #d9d9e3',
    borderRadius: '12px',
    resize: 'none',
    ":focus-visible": {
        outline: 'none',
    },
    fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
    fontSize: '16px',
    fontWeight: 400,
});


export default InputComponent;

