import {useEffect, useRef, useState} from "react";

import {Action, Post, PostTypeText, PostTypeTopic, PostTypeVideo} from "../../types/posts";
import useAuth from "../../hooks/useAuth";
import useGraph from "../../hooks/useGraph";
import {Client} from "../../client/client";

import {letsStartAction, nextTopicMessage, theVeryFirstMessage} from "./messages";
import {BOT_ID} from "./ai_tutor_chat";
import {StartingTheConversation, UserSwitchedGoal, UserWaitingForAnswer, UserWaitingForText, UserWaitingForTopic, UserWaitingForVideo, WaitingForUser, getConversationStatus} from "./conversation_status";
import {constructBotPost, getStandardActions} from "./create_post";

interface ConversationState {
    posts: Post[];
    actions: Action[];
    userWaitingForAnswer: boolean;
}


export default function useConversation() {
    const [conversationState, setConversationState] = useState<ConversationState>({} as ConversationState);
    const {user, preferences} = useAuth();
    const {nextNodeTowardsGoal} = useGraph();

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
        const status = getConversationStatus(conversationState.posts, user!.id, nextNodeTowardsGoal?.id);
        let post;
        let actions: Action[] = [];
        if (status === StartingTheConversation) {
            post = theVeryFirstMessage(user!.username);
            actions = [letsStartAction];
        } else if (status === UserWaitingForVideo) {
            post = constructBotPost([...conversationState.posts], nextNodeTowardsGoal, user!, PostTypeVideo);
            actions = getStandardActions(conversationState.posts, nextNodeTowardsGoal);
        } else if (status === UserWaitingForText) {
            post = constructBotPost([...conversationState.posts], nextNodeTowardsGoal, user!, PostTypeText);
            actions = getStandardActions(conversationState.posts, nextNodeTowardsGoal);
        } else if (status === UserWaitingForTopic) {
            post = constructBotPost([...conversationState.posts], nextNodeTowardsGoal, user!, PostTypeTopic);
            actions = getStandardActions(conversationState.posts, nextNodeTowardsGoal);
        } else if (status === UserWaitingForAnswer) {
            setConversationState({...conversationState, userWaitingForAnswer: true});
        } else if (status === WaitingForUser) {
            actions = getStandardActions(conversationState.posts, nextNodeTowardsGoal);
        } else if (status === UserSwitchedGoal && nextNodeTowardsGoal) {
            post = nextTopicMessage(nextNodeTowardsGoal);
            post.message = 'You have the new goal. The topic towards your goal is the following:\n\n' + post.message;
        }
        if (post) {
            if (preferences && preferences.tutor_personality && preferences.tutor_personality !== 'standard-tutor-personality') {
                post.props.tutor_personality = preferences?.tutor_personality;
            }
            Client.Post().saveBotPost(post, locationID).then((updatedPost) => {
                setConversationState({...conversationState, posts: [...conversationState.posts, updatedPost], actions: actions});
            });
        } else if (actions) {
            setConversationState({...conversationState, actions: actions});
        }
    }, [conversationState.posts && conversationState.posts.length, nextNodeTowardsGoal])

    return {conversationState, setConversationState};
}
