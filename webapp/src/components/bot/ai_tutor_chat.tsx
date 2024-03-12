import React, {useState, useRef, useEffect} from 'react';
import {Paper, IconButton, List, TextareaAutosize, Box, Button} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import {styled} from '@mui/system';

import {DashboardColors} from '../../ThemeOptions';
import useAuth from '../../hooks/useAuth';
import {Client} from '../../client/client';
import {Action, Post, PostActionIKnowThis, PostActionNextTopic, PostActionNextTopicKarelJS, PostActionNextTopicText, PostActionNextTopicVideo, PostTypeChatGPT, PostTypeFilledInByAction, PostTypeGoalFinish, PostTypeKarelJS, PostTypeText, PostTypeTopic, PostTypeVideo} from '../../types/posts';
import {Analytics} from '../../analytics';
import useGraph from '../../hooks/useGraph';
import {NodeStatusFinished, NodeWithResources} from '../../types/graph';

import PostComponent from './post_component';
import {constructBotPost, getBotPostActions} from './create_post';
import usePosts from './use_posts';
import {getUserPostAction, goalFinishedMessage} from './messages';
import BotStreamMessage from './bot_stream_message';

const staticHeight = `calc(100vh - (64px))`;
export const BOT_ID = 'aiTutorBotID01234567890123';

const AITutorChat = () => {
    const {posts, setPosts} = usePosts();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const {user} = useAuth();
    const locationID = `${user!.id}_${BOT_ID}`
    const {goals, nextNodeTowardsGoal, globalGraph, onReload} = useGraph();
    const [actions, setActions] = useState<Action[]>([]);
    const [userPostToChat, setUserPostToChat] = useState<Post | null>(null);
    const [botMessage, setBotMessage] = useState<string>('');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView();
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            scrollToBottom();
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (nextNodeTowardsGoal && posts && posts.length > 0) {
            const ac = getBotPostActions(posts, nextNodeTowardsGoal);
            setActions(ac);
            if (posts[posts.length-1].user_id !== BOT_ID && userPostToChat === null) {
                createPendingPost();
            }
            if (posts[posts.length-1].user_id === BOT_ID && posts[posts.length-1].post_type === PostTypeGoalFinish) {
                createPendingPost();
            }
        }
    }, [posts.length > 0 && posts[posts.length-1].id, nextNodeTowardsGoal?.id]);

    useEffect(() => {
        if (!userPostToChat) {
            return;
        }

        const fetchData = async () => {
            const response = await fetch(`${Client.Bot().getBotsRoute()}/ask?stream=true`, {
                method: 'POST',
                headers: {},
                body: JSON.stringify(userPostToChat)
            })
            if (response && response.body) {
                const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();

                let totalMessage = '';

                // eslint-disable-next-line no-constant-condition
                while (true) {
                    const {value, done} = await reader.read();
                    if (done) {
                        saveGPTAnswer(totalMessage);
                        setBotMessage('');
                        setUserPostToChat(null);
                        break;
                    }
                    const events = getData(value)
                    for (const event of events) {
                        if (event === '[DONE]') {
                            break;
                        }
                        if (event.length > 0) {
                            totalMessage += event;
                            setBotMessage(totalMessage);
                        }
                    }
                }

            }
        }
        fetchData();
    }, [userPostToChat?.id]);

    const saveGPTAnswer = (message: string) => {
        const post = {
            message: message,
            post_type: PostTypeChatGPT,
            props: {node_id: nextNodeTowardsGoal?.id || ''},
            user_id: BOT_ID,
            user: null,
            id: '',
        };
        Client.Post().saveBotPost(post, locationID).then((updatedPost) => {
            setPosts([...posts!, updatedPost]);
        });
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleSend();
            e.preventDefault();
        }
    }

    const handleSend = () => {
        savePostWithMessage(input, "");
    };

    const isNodeFinished = (node: NodeWithResources): boolean => {
        if (!globalGraph) {
            return true;
        }
        for (let i = 0; i < globalGraph!.nodes.length; i++) {
            if (globalGraph!.nodes[i].id === node.id) {
                return globalGraph!.nodes[i].status === NodeStatusFinished;
            }
        }
        return true;
    }

    const createPendingPost = () => {
        if (nextNodeTowardsGoal === null || isNodeFinished(nextNodeTowardsGoal)){
            return;
        }
        let post;
        if (posts[posts.length-1].user_id !== BOT_ID){
            const action = getUserPostAction(posts[posts.length-1].message);
            if (action.action_type === PostActionIKnowThis && nextNodeTowardsGoal) {
                post = constructBotPost([...posts!], nextNodeTowardsGoal, user!, PostTypeTopic);
            } else if (action.action_type === PostActionNextTopicVideo) {
                post = constructBotPost([...posts!], nextNodeTowardsGoal, user!, PostTypeVideo);
            } else if (action.action_type === PostActionNextTopicText) {
                post = constructBotPost([...posts!], nextNodeTowardsGoal, user!, PostTypeText);
            } else if (action.action_type === PostActionNextTopic) {
                post = constructBotPost([...posts!], nextNodeTowardsGoal, user!, PostTypeTopic);
            } else if (action.action_type === PostActionNextTopicKarelJS) {
                post = constructBotPost([...posts!], nextNodeTowardsGoal, user!, PostTypeKarelJS);
            }
        } else if (posts[posts.length - 1].post_type === PostTypeGoalFinish){
            post = constructBotPost([...posts!], nextNodeTowardsGoal, user!, PostTypeTopic);
        }
        if (post) {
            const locationID = `${user!.id}_${BOT_ID}`
            Client.Post().saveBotPost(post, locationID).then((updatedPost) => {
                setPosts([...posts!, updatedPost]);
            });
        }
        scrollToBottom();
    }

    const onButtonClick = (action: Action) => {
        Client.Post().saveUserPost(action.message_after_click, locationID, PostTypeFilledInByAction).then((userPost) => {
            let post;
            if (action.action_type === PostActionIKnowThis && nextNodeTowardsGoal) {
                Client.Node().markAsKnown(nextNodeTowardsGoal.id, user!.id).then(() => {
                    // for (let i = 0; i < globalGraph!.nodes.length; i++) {
                    //     if (globalGraph!.nodes[i].id === nextNodeID) {
                    //         globalGraph!.nodes[i].status = NodeStatusFinished;
                    //         break;
                    //     }
                    // }

                    if (goals.length > 0 && nextNodeTowardsGoal.id === goals[0].node_id){
                        Client.Post().saveBotPost(goalFinishedMessage(user?.username || '', nextNodeTowardsGoal.name || ''), locationID).then((updatedPost) => {
                            onReload();
                            setPosts([...posts!, userPost, updatedPost]);
                            setActions([]);
                        });
                    } else {
                        setPosts([...posts!, userPost]);
                    }
                    onReload();
                    scrollToBottom();
                });
                return;
            }
            if (action.action_type === PostActionNextTopicVideo) {
                post = constructBotPost([...posts!, userPost], nextNodeTowardsGoal, user!, PostTypeVideo);
            } else if (action.action_type === PostActionNextTopicText) {
                post = constructBotPost([...posts!, userPost], nextNodeTowardsGoal, user!, PostTypeText);
            } else if (action.action_type === PostActionNextTopic) {
                post = constructBotPost([...posts!, userPost], nextNodeTowardsGoal, user!, PostTypeTopic);
            } else if (action.action_type === PostActionNextTopicKarelJS) {
                post = constructBotPost([...posts!, userPost], nextNodeTowardsGoal, user!, PostTypeKarelJS);
            }
            if (post) {
                const locationID = `${user!.id}_${BOT_ID}`
                Client.Post().saveBotPost(post, locationID).then((updatedPost) => {
                    setPosts([...posts!, userPost, updatedPost]);
                });
            }
            scrollToBottom();
        });
    }

    const savePostWithMessage = (message: string, postType: string) => {
        Client.Post().saveUserPost(message, locationID, postType).then((userPost) => {
            Analytics.messageToAI({user_id: user!.id});
            userPost.props = {'node_id': nextNodeTowardsGoal?.id || ''};
            setUserPostToChat(userPost);
            setPosts([...posts!, userPost]);
            setInput('');
        });
    }

    return (
        <ChatContainer>
            <MessageList>
                {posts && posts.map((post, index) =>
                    <PostComponent
                        key={post.id}
                        post={post}
                        isLast={index === posts.length - 1 && post.user_id === BOT_ID && post.post_type !== PostTypeChatGPT}
                        scrollToBottom={scrollToBottom}
                        nextNodeID={nextNodeTowardsGoal?.id || ''}
                    />
                )}
                {userPostToChat && <BotStreamMessage message={botMessage} scrollToBottom={scrollToBottom}/>}
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
                                    bgcolor: DashboardColors.primary,
                                    '&:hover': {
                                        bgcolor: DashboardColors.primary,
                                    }
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

export default AITutorChat;

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


function getSubstrings(input: string, start: string, end: string): string[] {
    const result = [];
    let i = 0;
    while (i < input.length - start.length - end.length) {
        const potentialStart = input.substring(i, i + start.length);
        if (potentialStart === start) {
            const index = input.indexOf(end, i + start.length);
            if (index === -1){
                break
            }
            result.push(input.substring(i+start.length, index));
            i = index + end.length;
        } else {
            i++;
        }
    }

    return result;
}

function getData(input: string): string[] {
    return getSubstrings(input, 'data: {', '}\n\n');
}
