import React, {useState, useRef, useEffect} from 'react';
import {Paper, IconButton, List, ListItem, ListItemText, Typography, ListItemAvatar, Avatar, TextareaAutosize, Box, Button} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import {styled} from '@mui/system';
import { useNavigate } from 'react-router-dom';

import {DashboardColors} from '../../ThemeOptions';
import useAuth from '../../hooks/useAuth';
import {stringAvatar} from '../rhs/rhs';
import {Client} from '../../client/client';
import {Option, Post, PostTypeWithOptions, PostActionNextTopic, PostActionLink} from '../../types/posts';
import {Analytics} from '../../analytics';
import useGraph from '../../hooks/useGraph';
import {computeNextNode} from '../../context/graph_provider';

const staticHeight = `calc(100vh - (64px))`;
const BOT_ID = 'aiTutorBotID01234567890123';

const Chat = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const {user} = useAuth();
    const locationID = `${user!.id}_${BOT_ID}`
    const navigate = useNavigate();
    const {pathToGoal, goal, graph} = useGraph();
    const nextNode = computeNextNode(graph, pathToGoal, goal);
    const shouldLoadPosts = useRef(false);

    const loadPosts = () => {
        if (shouldLoadPosts.current) {
            Client.Bot().createFirstPosts().then((data) => {
                setPosts(data);
            });
            shouldLoadPosts.current = false;
        }
    }

    useEffect(() => {
        loadPosts();
    }, []);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    };

    useEffect(() => {
        scrollToBottom();
    }, [posts]);

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleSend();
            e.preventDefault();
        }
    }

    const handleSend = () => {
        Client.Post().savePost(input, locationID).then((post) => {
            setPosts([...posts, post]);
            setInput('');
            Analytics.messageToAI({user_id: user!.id});
        });
    };

    const onButtonClick = (option: Option) => {
        Client.Post().savePost(option.message_after_click, locationID).then((post) => {
            setPosts([...posts, post]);
            // Analytics.messageToAI({user_id: user!.id});
            if (option.action === PostActionLink) {
                navigate(option.link)
            } else if (option.action === PostActionNextTopic) {
                if (!nextNode) {
                    return;
                }
                navigate(`/nodes/${nextNode?.id}`)
            }
        });
    }

    return (
        <ChatContainer>
            <MessageList>
                {posts.map((post, index) => (
                    <ListItem
                        key={post.id}
                        sx={{
                            backgroundColor: post.user_id !== BOT_ID ? 'white' : DashboardColors.background,
                            pl: '40px',
                            pr: '40px',
                        }}
                    >
                        <Box display='flex' flexDirection='column' alignItems={'flex-start'}>
                            <Box display='flex' flexDirection='row' alignItems={'flex-start'}>
                                <ListItemAvatar>
                                    {post.user_id === BOT_ID ?
                                        <Avatar alt='bot' src='/favicon-32x32.png'/>
                                        :
                                        <Avatar alt={user!.username} {...stringAvatar(user!)}/>
                                    }
                                </ListItemAvatar>
                                <ListItemText
                                    sx={{mt: '8px'}}
                                    primary={
                                        <Typography component="span" sx={{whiteSpace: 'pre-wrap'}}>
                                            {post.message}
                                        </Typography>
                                    }
                                />
                            </Box>
                            {post.post_type === PostTypeWithOptions && index === posts.length - 1 &&
                                <Box>
                                    {post.props['options'].map((option : Option) => (
                                        <Button
                                            key={option.id}
                                            variant='contained'
                                            sx={{
                                                ml: '40px',
                                                mt: '20px',
                                                color: DashboardColors.background,
                                                bgcolor: DashboardColors.primary
                                            }}
                                            onClick={() => onButtonClick(option)}
                                        >
                                            {option.text_on_button}
                                        </Button>
                                    ))}
                                </Box>
                            }
                        </Box>
                    </ListItem>
                ))}
                <div ref={messagesEndRef}/>
            </MessageList>
            <MessageInputContainer>
                <MessageInput
                    placeholder="Type a message"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                />
                <IconButton
                    onClick={handleSend}
                    sx={{color:DashboardColors.primary}}
                    disabled={input.trim() === ''}
                >
                    <SendIcon/>
                </IconButton>
            </MessageInputContainer>
        </ChatContainer>
    );
}

export default Chat;

const ChatContainer = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    height: staticHeight,
});

const MessageList = styled(List)({
    flex: 1,
    overflow: 'auto',
    // padding: '20px',
    scrollbarColor: `${DashboardColors.primary} ${DashboardColors.background}`,
    scrollbarWidth: 'thin',
    "&::-webkit-scrollbar": {
        width: '8px',
        backgroundColor: DashboardColors.background,
    },
    "&::-webkit-scrollbar-thumb": {
        borderRadius: '10px',
        backgroundColor: DashboardColors.primary,
    },
});

const MessageInputContainer = styled(Paper)({
    display: 'flex',
    padding: '2px 4px',
    alignItems: 'center',
    margin: '20px',
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
