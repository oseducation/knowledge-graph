
import {NodeViewState, NodeWithResources} from "../../types/graph";
import {PostActionIKnowThis, PostActionNextTopic, PostActionNextTopicTest, PostActionNextTopicText, PostActionNextTopicVideo, PostTypeFilledInByAction, PostTypeTest, PostTypeText, PostTypeTopic, PostTypeVideo, PostWithActions} from "../../types/posts";

import {BOT_ID} from "./chat";


const letsStartMessage = "Great, Let's start with the next topic";
const iKnowThisMessage = "I know this topic, mark as done";
const anotherVideoMessage = "Show me another video on this topic, please";
const anotherTextMessage = "Show me some text, please";
const anotherTestMessage = "Test me on this topic";

export const theVeryFirstMessage = (username: string): PostWithActions => {
    return {
        post: {
            id: '',
            user_id: BOT_ID,
            message:`👋 Hello ${username}, and welcome to Vitsi AI! I'm your AI tutor, here to help you learn programming and navigate the world of code. 🚀
You might know nothing about coding, but it's OK. You'll start coding in minutes. In fact, our first goal will be to write our first program.
Feel free to ask any questions, and let's make your coding journey exciting and fruitful! 🎉`,
            post_type: PostTypeFilledInByAction,
            user: null,
            props: {},
        },
        actions: [letsStartAction],
    };
}

export const letsStartAction = {
    id: '1',
    text_on_button: "Let's start!",
    message_after_click: letsStartMessage,
    action_type: PostActionNextTopic,
    link: '',
};

const iKnowThisAction = {
    id: '2',
    text_on_button: "I know this!",
    message_after_click: iKnowThisMessage,
    action_type: PostActionIKnowThis,
    link: '',
}

const anotherVideoAction = {
    id: '3',
    text_on_button: "Video On a Topic",
    message_after_click: anotherVideoMessage,
    action_type: PostActionNextTopicVideo,
    link: '',
}

const anotherTextAction = {
    id: '4',
    text_on_button: "Text On a Topic",
    message_after_click: anotherTextMessage,
    action_type: PostActionNextTopicText,
    link: '',
}

const anotherTestAction = {
    id: '5',
    text_on_button: "Test me!",
    message_after_click: anotherTestMessage,
    action_type: PostActionNextTopicTest,
    link: '',
}

export const getActions = (state: NodeViewState, node: NodeWithResources) => {
    const actions = [iKnowThisAction];
    if (node.videos && state.videoIndex + 1 < node.videos.length) {
        actions.push(anotherVideoAction);
    }
    if (node.texts && state.textIndex + 1 < node.texts.length) {
        actions.push(anotherTextAction);
    }
    return actions;
}

export const getUserPostAction = (message: string) => {
    if (message === letsStartMessage) {
        return letsStartAction;
    } else if (message === iKnowThisMessage) {
        return iKnowThisAction;
    } else if (message === anotherVideoMessage) {
        return anotherVideoAction;
    } else if (message === anotherTextMessage) {
        return anotherTextAction;
    } else if (message === anotherTestMessage) {
        return anotherTestAction;
    } else {
        return letsStartAction;
    }
}

// export const standardActions = [iKnowThisAction, anotherVideoAction, anotherTextAction, anotherTestAction]
export const standardActions = [iKnowThisAction, anotherVideoAction, anotherTextAction];

export const nextTopicMessage = (node: NodeWithResources, state: NodeViewState): PostWithActions => {
    const actions = [];
    if (node.videos && state.videoIndex + 1 < node.videos.length) {
        actions.push(anotherVideoAction);
    }
    if (node.texts && state.textIndex + 1 < node.texts.length) {
        actions.push(anotherTextAction);
    }
    // if (state.testIndex + 1 < node.questions.length) {
    //     actions.push(anotherTestAction);
    // }
    return {
        post: {
            id: '',
            user_id: BOT_ID,
            message: `## Topic: ${node.name}\n\n ### Description: ${node.description}\n\n`,
            post_type: PostTypeTopic,
            user: null,
            props: {
                node_id: node.id,
            },
        },
        actions: actions,
    };
}

export const nextVideoMessage = (node: NodeWithResources, state: NodeViewState): PostWithActions => {
    const actions = [iKnowThisAction];
    if (node.videos && state.videoIndex + 2 < node.videos.length) {
        actions.push(anotherVideoAction);
    }
    if (node.texts && state.textIndex + 1 < node.texts.length) {
        actions.push(anotherTextAction);
    }
    // if (state.testIndex + 1 < node.questions.length) {
    //     actions.push(anotherTestAction);
    // }
    let videoIndex = state.videoIndex + 1;
    if (node.videos && state.videoIndex + 1 >= node.videos.length) {
        videoIndex = Math.floor(Math.random() * node.videos.length);
    }
    return {
        post: {
            id: '',
            user_id: BOT_ID,
            message: "Here's the video on the topic:\n\n",
            post_type: PostTypeVideo,
            user: null,
            props: {
                node_id: node.id,
                video_index: videoIndex,
                video_key: node.videos[videoIndex].key,
            },
        },
        actions: actions,
    };
}


export const nextTextMessage = (node: NodeWithResources, state: NodeViewState): PostWithActions => {
    const actions = [iKnowThisAction];
    if (node.videos && state.videoIndex + 1 < node.videos.length) {
        actions.push(anotherVideoAction);
    }
    if (node.texts && state.textIndex + 2 < node.texts.length) {
        actions.push(anotherTextAction);
    }
    // if (state.testIndex + 1 < node.questions.length) {
    //     actions.push(anotherTestAction);
    // }
    let textIndex = state.textIndex + 1;
    if (node.texts && state.textIndex + 1 >= node.texts.length) {
        textIndex = Math.floor(Math.random() * node.texts.length);
    }
    return {
        post: {
            id: '',
            user_id: BOT_ID,
            message: `Here's the text on the topic:\n\n ##${node.texts[textIndex].name}\n\n${node.texts[textIndex].text}`,
            post_type: PostTypeText,
            user: null,
            props: {
                node_id: node.id,
                text_index: textIndex,
            },
        },
        actions: actions,
    };
}

export const nextTestMessage = (node: NodeWithResources, state: NodeViewState): PostWithActions => {
    const actions = [iKnowThisAction];
    if (state.videoIndex + 1 < node.videos.length) {
        actions.push(anotherVideoAction);
    }
    if (state.textIndex + 1 < node.texts.length) {
        actions.push(anotherTextAction);
    }
    if (state.testIndex + 2 < node.questions.length) {
        actions.push(anotherTestAction);
    }
    let testIndex = state.testIndex + 1;
    if (state.textIndex + 1 >= node.questions.length) {
        testIndex = Math.floor(Math.random() * node.questions.length);
    }
    return {
        post: {
            id: '',
            user_id: BOT_ID,
            message: `Here's the question on the topic:\n\n ## ${node.questions[testIndex].name}\n\n${node.questions[testIndex].question}`,
            post_type: PostTypeTest,
            user: null,
            props: {
                node_id: node.id,
                test_index: testIndex,
                test_choices: node.questions[testIndex].choices,
            },
        },
        actions: actions,
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
