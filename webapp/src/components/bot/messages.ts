
import {NodeWithResources} from "../../types/graph";
import {PostActionIKnowThis, PostActionNextTopicTest, PostActionNextTopicText, PostActionNextTopicVideo, PostTypeTest, PostTypeText, PostTypeVideo, PostWithActions} from "../../types/posts";

import {BOT_ID} from "./chat";

export const theVeryFirstMessage = (username: string): PostWithActions => {
    return {
        post: {
            id: '',
            user_id: BOT_ID,
            message:`👋 Hello ${username}, and welcome to Vitsi AI! I'm your AI tutor, here to help you learn programming and navigate the world of code. 🚀
You might know nothing about coding, but it's OK. You'll start coding in minutes. In fact, our first goal will be to write our first program.
Feel free to ask any questions, and let's make your coding journey exciting and fruitful! 🎉`,
            post_type: '',
            user: null,
            props: {},
        },
        actions: [{
            id: '1',
            text_on_button: "Let's start!",
            message_after_click: "Great, Let's start with the next topic",
            action_type: PostActionNextTopicVideo,
            link: '',
        }],
    };
}

const standardActions = [{
    id: '2',
    text_on_button: "I know this!",
    message_after_click: "I know this topic, mark as done",
    action_type: PostActionIKnowThis,
    link: '',
}, {
    id: '3',
    text_on_button: "Maybe another video?",
    message_after_click: "Shot me other video on this topic, please",
    action_type: PostActionNextTopicVideo,
    link: '',
}, {
    id: '4',
    text_on_button: "I want text!",
    message_after_click: "Show me some text, please",
    action_type: PostActionNextTopicText,
    link: '',
}, {
    id: '5',
    text_on_button: "Test me!",
    message_after_click: "Test me on this topic",
    action_type: PostActionNextTopicTest,
    link: '',
}]

export const nextVideoMessage = (nodeID: string, videoIndex: number): PostWithActions => {
    return {
        post: {
            id: '',
            user_id: BOT_ID,
            message: '',
            post_type: PostTypeVideo,
            user: null,
            props: {
                node_id: nodeID,
                video_index: videoIndex,
            },
        },
        actions: standardActions,
    };
}


export const nextTextMessage = (node: NodeWithResources, textIndex: number): PostWithActions=> {
    return {
        post: {
            id: '',
            user_id: BOT_ID,
            message: '',
            post_type: PostTypeText,
            user: null,
            props: {
                node_id: node.id,
                text_id: node.texts[textIndex].id,
            },
        },
        actions: standardActions,
    };
}

export const nextTestMessage = (node: NodeWithResources, testIndex: number): PostWithActions => {
    return {
        post: {
            id: '',
            user_id: BOT_ID,
            message: '',
            post_type: PostTypeTest,
            user: null,
            props: {
                node_id: node.id,
                text_id: node.questions[testIndex].id,
            },
        },
        actions: standardActions,
    };
}

export const theVeryLastMessage = (username: string): PostWithActions => {
    return {
        post: {
            id: '',
            user_id: BOT_ID,
            message:`Hey ${username}, this was the last topic I had for you. I hope you enjoyed it and learned something new. 🤓 I'm working hard on the next topics and will let you know when they are ready. 🚀 You can still ask me questions regarding previous topics.`,
            post_type: '',
            user: null,
            props: {},
        },
        actions: [],
    };
}
