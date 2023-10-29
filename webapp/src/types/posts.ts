import {User} from "./users";

type PostType = "" | "with_options";
export const PostTypeWithOptions:PostType = "with_options";

export type Post = {
    id: string;
    message: string;
    user_id: string;
    post_type: PostType;
    props: Record<string, any>;
    user: User;
}

export type Message = {
    text: string;
    isBot: boolean;
}


export type Option = {
    id: string;
    text_on_button: string;
    message_after_click: string;
    action: PostActionType;
    link: string;
}

export const PostActionNextTopic:PostActionType = "next_topic";
export const PostActionLink:PostActionType = "link";
type PostActionType = "next_topic" | "link";
