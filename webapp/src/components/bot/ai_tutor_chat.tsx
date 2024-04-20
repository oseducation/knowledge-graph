import React, {useState, useRef, useEffect} from 'react';
import {List, Box, Button} from '@mui/material';
import {styled} from '@mui/system';

import {DashboardColors} from '../../ThemeOptions';
import useAuth from '../../hooks/useAuth';
import {Client} from '../../client/client';
import {Action, Post, PostType, PostTypeChatGPT, PostTypeChatGPTCorrectAnswerExplanation, PostTypeChatGPTIncorrectAnswerExplanation, PostTypeFilledInByAction, PostTypeTestAnswer, PostTypeText, PostTypeTopic, PostTypeVideo} from '../../types/posts';
import {Analytics} from '../../analytics';
import useGraph from '../../hooks/useGraph';

import PostComponent from './post_component';
import {constructBotPost} from './create_post';
import BotStreamMessage from './bot_stream_message';
import InputComponent from './input_component';
import BotComponent from './bot_component';
import useConversation from './use_converstion';

const staticHeight = `calc(100vh - (64px))`;
export const BOT_ID = 'aiTutorBotID01234567890123';

interface TestCheckInterface {
    body: string;
    isCorrect: boolean;
}

const AITutorChat = () => {
    const {conversationState, setConversationState} = useConversation();
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const {user, preferences} = useAuth();
    const locationID = `${user!.id}_${BOT_ID}`
    const {nextNodeTowardsGoal} = useGraph();
    const [userPostToChat, setUserPostToChat] = useState<Post | null>(null);
    const [botMessage, setBotMessage] = useState<string>('');
    const [scrollListeners, setScrollListeners] = useState<(() => void)[]>([]);
    const [testCheck, setTestCheck] = useState<TestCheckInterface | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView();
    }

    const addScrollListener = (listener: () => void) => {
        setScrollListeners([...scrollListeners, listener]);
    }

    const removeEventListener = (listener: () => void) => {
        setScrollListeners(scrollListeners.filter((l) => l !== listener));
    }

    const handleScroll = () => {
        scrollListeners.forEach((listener) => {
            listener();
        });
    };

    useEffect(() => {
        const w = window as any;
        if (w.Tawk_API) {
            w.Tawk_API.hideWidget();
        }
        return () => {
            if (w.Tawk_API) {
                w.Tawk_API.showWidget();
            }
        };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            scrollToBottom();
        }, 500);

        return () => clearTimeout(timer);
    }, []);

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
                            let detectedIntent: PostType|null = null;
                            if (event === '{intent: show_text}') {
                                detectedIntent = PostTypeText
                            } else if (event === '{intent: show_video}') {
                                detectedIntent = PostTypeVideo
                            }
                            if (detectedIntent){
                                const post = constructBotPost([...conversationState.posts], nextNodeTowardsGoal, user!, detectedIntent);
                                if (post) {
                                    if (preferences && preferences.tutor_personality && preferences.tutor_personality !== 'standard-tutor-personality') {
                                        post.props.tutor_personality = preferences?.tutor_personality;
                                    }

                                    Client.Post().saveBotPost(post, locationID).then((updatedPost) => {
                                        setConversationState({...conversationState, posts: [...conversationState.posts, updatedPost]});
                                        setBotMessage('');
                                        setUserPostToChat(null);
                                    });
                                }
                                return;
                            }

                            totalMessage += event;
                            setBotMessage(totalMessage);
                        }
                    }
                }
            }
        }
        fetchData();
    }, [userPostToChat?.id]);

    useEffect(() => {
        if (!testCheck) {
            return;
        }
        const fetchData = async () => {
            let endpoint = "incorrect_answer"
            if (testCheck.isCorrect) {
                endpoint = "correct_answer"
            }
            const response = await fetch(`${Client.Bot().getBotsRoute()}/${endpoint}`, {
                method: 'POST',
                headers: {},
                body: testCheck.body,
            })
            if (response && response.body) {
                const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();

                let totalMessage = '';

                // eslint-disable-next-line no-constant-condition
                while (true) {
                    const {value, done} = await reader.read();
                    if (done) {
                        if (testCheck.isCorrect) {
                            saveGPTCorrectAnswerExplanation(totalMessage)
                        } else {
                            saveGPTIncorrectAnswerExplanation(totalMessage)
                        }
                        setBotMessage('');
                        setTestCheck(null);
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
    }, [testCheck]);

    const saveGPTAnswer = (message: string) => {
        saveGPTPost(message, PostTypeChatGPT);
    }

    const saveGPTCorrectAnswerExplanation = (message: string) => {
        saveGPTPost(message, PostTypeChatGPTCorrectAnswerExplanation);
    }

    const saveGPTIncorrectAnswerExplanation = (message: string) => {
        saveGPTPost(message, PostTypeChatGPTIncorrectAnswerExplanation);
    }

    const saveGPTPost = (message: string, postType:PostType) => {
        const post = {
            message: message,
            post_type: postType,
            props: {node_id: nextNodeTowardsGoal?.id || '', tutor_personality: preferences?.tutor_personality || 'standard-tutor-personality'},
            user_id: BOT_ID,
            user: null,
            id: '',
        };
        Client.Post().saveBotPost(post, locationID).then((updatedPost) => {
            setConversationState({...conversationState, posts: [...conversationState.posts, updatedPost]})
        });
    }

    const onButtonClick = (action: Action) => {
        Client.Post().saveUserPost(action.message_after_click, locationID, PostTypeFilledInByAction).then((userPost) => {
            setConversationState({...conversationState, posts: [...conversationState.posts, userPost]})
        });
    }

    const handleSend = (input: string): Promise<void> => {
        return Client.Post().saveUserPost(input, locationID, '').then((userPost) => {
            Analytics.messageToAI({user_id: user!.id});
            userPost.props = {'node_id': nextNodeTowardsGoal?.id || ''};
            setUserPostToChat(userPost);
            setConversationState({...conversationState, posts: [...conversationState.posts, userPost]});
        });
    }

    const getLastVideoIndex = () => {
        if (!conversationState.posts) {
            return -1;
        }
        for (let i = conversationState.posts.length - 1; i >= 0; i--) {
            if (conversationState.posts[i].post_type === PostTypeVideo) {
                return i;
            } else if (conversationState.posts[i].post_type === PostTypeTopic) {
                return -1;
            }
        }
        return -1;
    }

    const lastVideoIndex = getLastVideoIndex();

    const questionAnsweredCorrectly = async (questionID: string, answer: string) => {
        const body = JSON.stringify(questionID);
        questionAnswered(body, true, answer);
    }

    const questionAnsweredIncorrectly = async (questionID: string, answer: string) => {
        const body = JSON.stringify({question_id: questionID, incorrect_answer: answer});
        questionAnswered(body, false, answer);
    }

    const questionAnswered = async (body: string, isCorrect: boolean, answer: string) => {
        Client.Post().saveUserPost(answer, locationID, PostTypeTestAnswer).then((returnedPost) => {
            setTestCheck({body, isCorrect});
            setConversationState({...conversationState, posts: [...conversationState.posts, returnedPost]})
        });

    }

    return (
        <ChatContainer>
            <MessageList onScroll={handleScroll}>
                {conversationState.posts && conversationState.posts.map((post, index) =>
                    <PostComponent
                        key={post.id}
                        post={post}
                        isLast={index === conversationState.posts.length - 1 && post.user_id === BOT_ID && post.post_type !== PostTypeChatGPT && post.post_type !== PostTypeChatGPTCorrectAnswerExplanation && post.post_type !== PostTypeChatGPTIncorrectAnswerExplanation}
                        scrollToBottom={scrollToBottom}
                        nextNodeID={nextNodeTowardsGoal?.id || ''}
                        addScrollListener={addScrollListener}
                        removeScrollListener={removeEventListener}
                        isLastVideo={index === lastVideoIndex}
                        onRightChoice={(answer: string) => {questionAnsweredCorrectly(post.props.question_id || '', answer)}}
                        onWrongChoice={(answer: string) => {questionAnsweredIncorrectly(post.props.question_id || '', answer)}}
                    />
                )}
                {botMessage && <BotStreamMessage message={botMessage} scrollToBottom={scrollToBottom} tutorPersonality={preferences?.tutor_personality || 'standard-tutor-personality'}/>}
                {conversationState.actions &&
                    <Box>
                        {conversationState.actions.map((action : Action) => (
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
            <Box display={'flex'} flexDirection={'row'} alignItems={'center'} sx={{pl: {xs: '2px', sm: '10px', md: '20px', lg: '40px'},}}>
                <BotComponent/>
                <InputComponent handleSend={handleSend}/>
            </Box>
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
