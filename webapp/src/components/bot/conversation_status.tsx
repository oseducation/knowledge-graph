import {Post, PostTypeChatGPTCorrectAnswerExplanation, PostTypeChatGPTIncorrectAnswerExplanation, PostTypeGoalFinish, PostTypeTest, PostTypeTestAnswer, PostTypeTopicFinish} from "../../types/posts"
import {NodeWithResources} from "../../types/graph";

import {iKnowThisMessage, anotherVideoMessage, anotherTextMessage, letsStartMessage, anotherTestMessage} from "./messages";
import {BOT_ID} from "./ai_tutor_chat";


export type ConversationStatusType =
    "waiting_for_user" |
    "starting_the_conversation" |
    "user_waiting_for_answer" |
    "user_waiting_for_text" |
    "user_waiting_for_video" |
    "user_waiting_for_topic" |
    "user_switched_goal" |
    "user_waiting_for_the_first_test" |
    "user_waiting_for_another_test" |
    "user_waiting_for_the_tests_result" |
    "waiting_for_user_to_answer_the_test" |
    "user_waiting_for_answer_check" |
    "waiting_for_user_to_start";

export const StartingTheConversation:ConversationStatusType = "starting_the_conversation";
export const WaitingForUser:ConversationStatusType = "waiting_for_user";
export const WaitingForUserToStart:ConversationStatusType = "waiting_for_user_to_start";
export const UserWaitingForAnswer:ConversationStatusType = "user_waiting_for_answer";
export const UserWaitingForText:ConversationStatusType = "user_waiting_for_text";
export const UserWaitingForVideo:ConversationStatusType = "user_waiting_for_video";
export const UserWaitingForTopic:ConversationStatusType = "user_waiting_for_topic";
export const UserSwitchedGoal:ConversationStatusType = "user_switched_goal";

export const UserWaitingForTheFirstTest:ConversationStatusType = "user_waiting_for_the_first_test";
export const UserWaitingForAnotherTest:ConversationStatusType = "user_waiting_for_another_test";
export const UserWaitingForTheTestsResult:ConversationStatusType = "user_waiting_for_the_tests_result";
export const WaitingForUserToAnswerTheTest:ConversationStatusType = "waiting_for_user_to_answer_the_test";
export const UserWaitingForAnswerCheck:ConversationStatusType = "user_waiting_for_answer_check";

export const getConversationStatus = (posts: Post[], userID: string, node?: NodeWithResources): ConversationStatusType => {
    if (posts.length === 0) {
        return StartingTheConversation;
    }
    if (posts.length === 1) {
        return WaitingForUserToStart;
    }
    if (!node) {
        // TODO this should not happen?
        return WaitingForUser;
    }

    // let goalSwitchDetected = false;
    // for (let i = posts.length-1; i >= 0; i--) {
    //     if (posts[i].message === iKnowThisMessage) {
    //         break;
    //     }
    //     if (posts[i].post_type === PostTypeGoalFinish) {
    //         break;
    //     }
    //     if (posts[i].props && posts[i].props.node_id) {
    //         if (posts[i].props.node_id !== node.id) {
    //             goalSwitchDetected = true;
    //         }
    //         break;
    //     }
    // }
    // if (goalSwitchDetected) {
    //     return UserSwitchedGoal;
    // }

    const lastPost = posts[posts.length - 1];
    if (lastPost.post_type === "" && lastPost.user_id === userID) {
        return UserWaitingForAnswer;
    }
    if (lastPost.post_type === PostTypeGoalFinish || lastPost.post_type === PostTypeTopicFinish || lastPost.message === letsStartMessage) {
        return UserWaitingForTopic;
    }
    if (lastPost.message === iKnowThisMessage) {
        if (node.questions.length > 0) {
            return UserWaitingForTheFirstTest
        }
        return UserWaitingForTopic;
    }
    if(lastPost.message === anotherVideoMessage) {
        return UserWaitingForVideo;
    }
    if (lastPost.message === anotherTextMessage) {
        return UserWaitingForText;
    }
    if (lastPost.message === anotherTestMessage) {
        return UserWaitingForAnotherTest;
    }
    if (lastPost.user_id === BOT_ID) {
        const lastTestIndex = getLastTestIndex(posts, node.id);
        if ((lastPost.post_type === PostTypeChatGPTCorrectAnswerExplanation ||
            lastPost.post_type === PostTypeChatGPTIncorrectAnswerExplanation) &&
            lastTestIndex < node.questions.length-1) {
            return UserWaitingForAnotherTest;
        }
        if ((lastPost.post_type === PostTypeChatGPTCorrectAnswerExplanation ||
            lastPost.post_type === PostTypeChatGPTIncorrectAnswerExplanation) &&
            lastTestIndex === node.questions.length-1) {
            return UserWaitingForTheTestsResult;
        }
        if (lastPost.post_type === PostTypeTest) {
            return WaitingForUserToAnswerTheTest
        }
        return WaitingForUser;
    }
    if (lastPost.post_type === PostTypeTestAnswer) {
        return UserWaitingForAnswerCheck;
    }
    return WaitingForUser;
}

const getLastTestIndex = (posts: Post[], nodeID: string): number => {
    for (let i = posts.length-1; i >= 0; i--) {
        if (posts[i].post_type === PostTypeTest && posts[i].props && posts[i].props.test_index !== undefined && posts[i].props.node_id === nodeID) {
            return posts[i].props.test_index;
        }
    }
    return -1;
}
