import {Button, Paper} from '@mui/material';
import React, {useState} from 'react';
import SendIcon from '@mui/icons-material/Send';
import styled from 'styled-components';

interface Props {
    onInputSend: (message: string) => void;
}

const PostInput = (props: Props) => {
    const [inputValue, setInputValue] = useState('');

    const handleSend = () => {
        if (inputValue.trim() !== '') {
            props.onInputSend(inputValue);
            setInputValue('');
        }
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleSend();
            e.preventDefault();
        }
    }

    return (
        <Paper component="form"
            style={{
                display: 'flex',
                flexGrow: 1,
                flexDirection: 'column',
                alignItems: 'center',
                border: '1 solid #d9d9e3',
                borderWidth: '1px',
                borderColor: 'rgba(0,0,0,.1)',
                boxShadow: 'rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 0px 15px 0px',
                width: '100%',
                position: 'relative',
                padding: '8px 16px',
                bottom: '0px',
            }}
        >
            <StyledTextarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type a message"
            />
            <Button
                color="primary"
                onClick={handleSend}
                disabled={inputValue.trim() === ''}
                style={{
                    border: '0 solid #d9d9e3',
                    position: 'absolute',
                    display: 'flex',
                    bottom: '12px',
                    right: '12px',
                    margin: '0px',
                    padding: '0px',
                    minWidth: '40px',
                }}
            >
                <SendIcon/>
            </Button>
        </Paper>
    );
};

const StyledTextarea = styled('textarea')`
    display: block;
    max-height: 200px;
    height: 56px;
    overflow-y: hidden;
    width: 100%;
    padding-right: 40px;
    font-size: 16px;
    font-weight: 400;
    border: 0 solid #d9d9e3;
    border-radius: 0;
    resize: none;

    &:focus-visible {
        outline: none;
    }
`;

export default PostInput;

