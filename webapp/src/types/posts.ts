import {User} from "./users";

export type PostType = "" | "with_actions" | "video" | "text" | "test" | "topic" | "filled_in_by_action" | "karel_js" | "chat_gpt" | "goal_finished";
export const PostTypeWithActions:PostType = "with_actions";
export const PostTypeVideo:PostType = "video";
export const PostTypeTopic:PostType = "topic";
export const PostTypeText:PostType = "text";
export const PostTypeTest:PostType = "test";
export const PostTypeKarelJS:PostType = "karel_js";
export const PostTypeFilledInByAction:PostType = "filled_in_by_action";
export const PostTypeGoalFinish:PostType = "goal_finished";
export const PostTypeChatGPT:PostType = "chat_gpt";

export type Post = {
    id: string;
    message: string;
    user_id: string;
    post_type: PostType;
    props: Record<string, any>;
    user: User | null;
}

export type PostWithActions = {
    post: Post;
    actions: Action[];
}


export type Message = {
    text: string;
    isBot: boolean;
}

// if message is defined ignore the messageKey and messageValueMap,
// otherwise get the message from i18n with messageKey and messageValueMap
export type MessageWithActions = {
    message: string;
    actions: Action[];
}



export type Action = {
    id: string;
    text_on_button: string;
    message_after_click: string;
    action_type: PostActionType;
    link: string;
}

export const PostActionNextTopic:PostActionType = "next_topic";
export const PostActionNextTopicVideo:PostActionType = "next_topic_video";
export const PostActionNextTopicText:PostActionType = "next_topic_text";
export const PostActionNextTopicTest:PostActionType = "next_topic_test";
export const PostActionNextTopicKarelJS:PostActionType = "next_topic_karel_js";
export const PostActionLink:PostActionType = "link";
export const PostActionIKnowThis:PostActionType = "i_know_this";
type PostActionType = "next_topic_video" | "link" | "i_know_this" | "next_topic_text" | "next_topic_test" | "next_topic" | "next_topic_karel_js";
