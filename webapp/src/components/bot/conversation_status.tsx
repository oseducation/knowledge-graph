import {Post, PostTypeGoalFinish} from "../../types/posts"

import {iKnowThisMessage, anotherVideoMessage, anotherTextMessage} from "./messages";
import {BOT_ID} from "./ai_tutor_chat";


export type ConversationStatusType =
    "waiting_for_user" |
    "user_waiting_for_answer_check" |
    "starting_the_conversation" |
    "user_waiting_for_answer" |
    "user_waiting_for_text" |
    "user_waiting_for_video" |
    "user_waiting_for_topic" |
    "user_switched_goal";

export const StartingTheConversation:ConversationStatusType = "starting_the_conversation";
export const WaitingForUser:ConversationStatusType = "waiting_for_user";
export const UserWaitingForAnswer:ConversationStatusType = "user_waiting_for_answer";
export const UserWaitingForText:ConversationStatusType = "user_waiting_for_text";
export const UserWaitingForVideo:ConversationStatusType = "user_waiting_for_video";
export const UserWaitingForTopic:ConversationStatusType = "user_waiting_for_topic";
export const UserSwitchedGoal:ConversationStatusType = "user_switched_goal";



export const getConversationStatus = (posts: Post[], userID: string, nodeID?: string): ConversationStatusType => {
    if (posts.length === 0) {
        return StartingTheConversation;
    }
    if (posts.length === 1) {
        return WaitingForUser;
    }

    if (nodeID) {
        let goalSwitchDetected = false;
        for (let i = posts.length-1; i >= 0; i--) {
            if (posts[i].message === iKnowThisMessage) {
                break;
            }
            if (posts[i].post_type === PostTypeGoalFinish) {
                break;
            }
            if (posts[i].props && posts[i].props.node_id) {
                if (posts[i].props.node_id !== nodeID) {
                    goalSwitchDetected = true;
                }
                break;
            }
        }
        if (goalSwitchDetected) {
            return UserSwitchedGoal;
        }
    }

    const lastPost = posts[posts.length - 1];
    if (lastPost.post_type === "" && lastPost.user_id === userID) {
        return UserWaitingForAnswer;
    }
    if (lastPost.post_type === PostTypeGoalFinish) {
        return UserWaitingForTopic;
    }
    if (lastPost.message === iKnowThisMessage) {
        return UserWaitingForTopic;
    } else if(lastPost.message === anotherVideoMessage) {
        return UserWaitingForVideo;
    } else if (lastPost.message === anotherTextMessage) {
        return UserWaitingForText;
    }
    if (lastPost.user_id === BOT_ID) {
        return WaitingForUser;
    }
    return WaitingForUser;
}
