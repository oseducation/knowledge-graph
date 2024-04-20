import {useEffect, useRef, useState} from "react";

import {Action, Post, PostTypeChatGPTCorrectAnswerExplanation, PostTypeChatGPTIncorrectAnswerExplanation, PostTypeTest, PostTypeText, PostTypeTopic, PostTypeVideo} from "../../types/posts";
import useAuth from "../../hooks/useAuth";
import useGraph from "../../hooks/useGraph";
import {Client} from "../../client/client";
import {NodeWithResources} from "../../types/graph";

import {TopicFinishedMessage, goalFinishedMessage, letsStartAction, nextTopicMessage, theVeryFirstMessage} from "./messages";
import {BOT_ID} from "./ai_tutor_chat";
import {StartingTheConversation, UserSwitchedGoal, UserWaitingForAnotherTest, UserWaitingForAnswer, UserWaitingForAnswerCheck, UserWaitingForText, UserWaitingForTheFirstTest, UserWaitingForTheTestsResult, UserWaitingForTopic, UserWaitingForVideo, WaitingForUser, WaitingForUserToAnswerTheTest, WaitingForUserToStart, getConversationStatus} from "./conversation_status";
import {getNextContent, getStandardActions} from "./create_post";

interface ConversationState {
    posts: Post[];
    actions: Action[];
    userWaitingForAnswer: boolean;
    userWaitingForAnswerCheck: boolean;
}


export default function useConversation() {
    const [conversationState, setConversationState] = useState<ConversationState>({} as ConversationState);
    const {user, preferences} = useAuth();
    const {nextNodeTowardsGoal, currentGoalID, onReload} = useGraph();

    const locationID = `${user!.id}_${BOT_ID}`

    const hasPosted = useRef(false);

    useEffect(() => {
        if (!user) {
            return;
        }
        if (hasPosted.current) {
            return;
        }
        hasPosted.current = true;
        Client.Post().getPosts(locationID, false).then((retPosts) => {
            setConversationState({...conversationState, posts: retPosts})
        });
    }, [])

    useEffect(() => {
        if (!conversationState.posts || !nextNodeTowardsGoal) {
            return
        }
        const posts = [...conversationState.posts]
        const status = getConversationStatus(posts, user!.id, nextNodeTowardsGoal);
        let post;
        let actions: Action[] = [];
        if (status === StartingTheConversation) {
            post = theVeryFirstMessage(user!.username);
            actions = [letsStartAction];
        } else if (status === UserWaitingForVideo) {
            post = getNextContent([...posts], nextNodeTowardsGoal, PostTypeVideo);
            actions = getStandardActions(posts, nextNodeTowardsGoal);
        } else if (status === UserWaitingForText) {
            post = getNextContent([...posts], nextNodeTowardsGoal, PostTypeText);
            actions = getStandardActions(posts, nextNodeTowardsGoal);
        } else if (status === UserWaitingForTopic) {
            post = getNextContent([...posts], nextNodeTowardsGoal, PostTypeTopic);
            actions = getStandardActions(posts, nextNodeTowardsGoal);
        } else if (status === UserWaitingForAnswer) {
            setConversationState({...conversationState, userWaitingForAnswer: true});
        } else if (status === WaitingForUser) {
            actions = getStandardActions(posts, nextNodeTowardsGoal);
        } else if (status === UserSwitchedGoal && nextNodeTowardsGoal) {
            post = nextTopicMessage(nextNodeTowardsGoal);
            post.message = 'You have the new goal. The topic towards your goal is the following:\n\n' + post.message;
        } else if (status === UserWaitingForTheFirstTest || status === UserWaitingForAnotherTest) {
            post = getNextContent([...posts], nextNodeTowardsGoal, PostTypeTest);
        } else if (status === UserWaitingForAnswerCheck) {
            setConversationState({...conversationState, userWaitingForAnswerCheck: true});
        } else if (status === WaitingForUserToAnswerTheTest) {
            // Do nothing
            actions = [];
        } else if (status === WaitingForUserToStart) {
            actions = [letsStartAction];
        }else if (status === UserWaitingForTheTestsResult) {
            if (checkTestsResult(posts, nextNodeTowardsGoal)) {
                Client.Node().markAsKnown(nextNodeTowardsGoal.id, user!.id).then(() => {
                    if (nextNodeTowardsGoal.id === currentGoalID){
                        post = goalFinishedMessage(user?.username || '', nextNodeTowardsGoal.name || '');
                    } else {
                        post = TopicFinishedMessage(user?.username || '', nextNodeTowardsGoal.name || '');
                    }
                    if (preferences && preferences.tutor_personality && preferences.tutor_personality !== 'standard-tutor-personality') {
                        post.props.tutor_personality = preferences?.tutor_personality;
                    }
                    Client.Post().saveBotPost(post, locationID).then((updatedPost) => {
                        setConversationState({...conversationState, posts: [...posts, updatedPost], actions: [...actions]});
                    });
                    onReload();
                });
                return;
            } else {
                post = getNextContent([...conversationState.posts], nextNodeTowardsGoal, PostTypeTopic);
                post.message = `I think you need some more time on **${nextNodeTowardsGoal.name}**. Let's go through it again.\n\n` + post.message;
            }
        }
        if (post) {
            if (preferences && preferences.tutor_personality && preferences.tutor_personality !== 'standard-tutor-personality') {
                post.props.tutor_personality = preferences?.tutor_personality;
            }
            Client.Post().saveBotPost(post, locationID).then((updatedPost) => {
                setConversationState({...conversationState, posts: [...posts, updatedPost], actions: [...actions]});
            });
        } else if (actions) {
            setConversationState({...conversationState, actions: [...actions]});
        }
    }, [conversationState.posts && conversationState.posts.length, nextNodeTowardsGoal])

    return {conversationState, setConversationState};
}

const checkTestsResult = (posts: Post[], node: NodeWithResources): boolean => {
    let correct = 0;
    let incorrect = 0;
    for (let i = posts.length - 1; i >= 0; i--) {
        if (posts[i].props && posts[i].props.node_id && posts[i].props.node_id === node.id) {
            if (posts[i].post_type === PostTypeChatGPTCorrectAnswerExplanation) {
                correct++;
            } else if (posts[i].post_type === PostTypeChatGPTIncorrectAnswerExplanation) {
                incorrect++;
            } else if (posts[i].post_type === PostTypeTopic) {
                break;
            }
        }
    }
    if (correct + incorrect !== node.questions.length) {
        return false;
    }
    if (correct + incorrect === 0) {
        return true;
    }
    if (correct / (correct + incorrect) < 0.6) {
        return false;
    }
    return true
}
