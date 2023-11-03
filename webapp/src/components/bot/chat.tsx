import React, {useState, useRef, useEffect} from 'react';
import {Paper, IconButton, List, TextareaAutosize, Box, Button} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import {styled} from '@mui/system';

import {DashboardColors} from '../../ThemeOptions';
import useAuth from '../../hooks/useAuth';
import {Client} from '../../client/client';
import {Action, PostActionIKnowThis} from '../../types/posts';
import {Analytics} from '../../analytics';
import useGraph from '../../hooks/useGraph';
import {computeNextNode} from '../../context/graph_provider';
import usePosts from '../../hooks/use_posts';
import createPost from '../../hooks/create_post';

import PostComponent from './post_component';


const staticHeight = `calc(100vh - (64px))`;
export const BOT_ID = 'aiTutorBotID01234567890123';

const Chat = () => {
    const {posts, setPosts} = usePosts();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const {user} = useAuth();
    const locationID = `${user!.id}_${BOT_ID}`
    const {pathToGoal, goal, graph} = useGraph();
    const nextNodeID = computeNextNode(graph, pathToGoal, goal);
    const [shouldCreateNewPost, setShouldCreateNewPost] = useState<boolean>(true);
    const {post, actions, setPost, setActions} = createPost(posts, nextNodeID, shouldCreateNewPost);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            scrollToBottom();
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleSend();
            e.preventDefault();
        }
    }

    const handleSend = () => {
        savePostWithMessage(input);
    };

    const onButtonClick = (action: Action) => {
        savePostWithMessage(action.message_after_click);
        if (action.action_type === PostActionIKnowThis && nextNodeID) {
            Client.Node().markAsKnown(nextNodeID, user!.id)
            setShouldCreateNewPost(prev => !prev);
        }
    }

    const savePostWithMessage = (message: string) => {
        Client.Post().saveUserPost(message, locationID).then((userPost) => {
            if (post) {
                setPosts([...posts!, post, userPost]);
            } else {
                setPosts([...posts!, userPost]);
            }
            setPost(null);
            setActions([]);
            setInput('');
            setShouldCreateNewPost(prev => !prev);
            scrollToBottom();
            Analytics.messageToAI({user_id: user!.id});
        });
    }

    return (
        <ChatContainer>
            <MessageList>
                {posts && posts.map((post) => <PostComponent key={post.id} post={post} isLast={false}/>)}
                {post && <PostComponent post={post} isLast={true}/>}
                {actions &&
                    <Box>
                        {actions.map((action : Action) => (
                            <Button
                                key={action.text_on_button}
                                variant='contained'
                                sx={{
                                    ml: '40px',
                                    mt: '20px',
                                    color: DashboardColors.background,
                                    bgcolor: DashboardColors.primary
                                }}
                                onClick={() => onButtonClick(action)}
                            >
                                {action.text_on_button}
                            </Button>
                        ))}
                    </Box>
                }
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

/*
const TypingIndicator = styled('div')`
  height: 20px;
  width: 50px;
  border-radius: 10px;
  background-color: #e0e0e0;
  position: relative;
  margin: 10px 0;

  &::before,
  &::after {
    content: '';
    display: block;
    height: 10px;
    width: 10px;
    background-color: #9e9e9e;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    animation: bounce 0.5s ease infinite;
  }

  &::before {
    left: 10px;
    animation-delay: 0.1s;
  }

  &::after {
    right: 10px;
    animation-delay: 0.2s;
  }

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(-50%) scale(1);
    }
    50% {
      transform: translateY(-50%) scale(0.6);
    }
  }
`;
*/
