
import {NodeViewState, NodeWithResources} from "../../types/graph";
import {Post, PostActionIKnowThis, PostActionNextTopic, PostActionNextTopicKarelJS, PostActionNextTopicTest, PostActionNextTopicText, PostActionNextTopicVideo, PostTypeFilledInByAction, PostTypeGoalFinish, PostTypeKarelJS, PostTypeTest, PostTypeText, PostTypeTopic, PostTypeVideo} from "../../types/posts";

import {BOT_ID} from "./ai_tutor_chat";


const letsStartMessage = "Great, Let's start with the next topic";
const iKnowThisMessage = "I know this topic, mark as done";
const anotherVideoMessage = "Show me another video on this topic, please";
const anotherTextMessage = "Show me some text, please";
const anotherTestMessage = "Test me on this topic";
const karelJSActionMessage = "Let me write some code";

export const theVeryFirstMessage = (username: string): Post => {
    return {
        id: '',
        user_id: BOT_ID,
        message:`👋 Hello ${username}, and welcome to Vitsi AI! I'm your AI tutor, here to guide you through the essentials of becoming a standout startup founder. 🚀
You might know nothing about startups or not know if you want to start one, but it's OK. In fact, our first goal will be "Deciding When to Start Your Own Company".
You may request a video or a text on a topic, or you can progress to the next topic by clicking the "I know this" button.
Feel free to ask any questions, and let's make your entrepreneurship journey exciting and fruitful! 🎉`,
        post_type: PostTypeFilledInByAction,
        user: null,
        props: {},
    };
}

export const goalFinishedMessage = (username: string, goalName: string): Post => {
    return {
        id: '',
        user_id: BOT_ID,
        message:`Congratulations ${username}! You've completed the goal - **${goalName}**. 🎉`,
        post_type: PostTypeGoalFinish,
        user: null,
        props: {},
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

const karelJSAction = {
    id: '6',
    text_on_button: "Let me code!",
    message_after_click: karelJSActionMessage,
    action_type: PostActionNextTopicKarelJS,
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
    if (node.environment === 'karel_js'){
        actions.push(karelJSAction);
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
    } else if (message === karelJSActionMessage) {
        return karelJSAction;
    } else {
        return letsStartAction;
    }
}

export const nextKarelJSMessage = (node: NodeWithResources): Post => {
    return {
        id: '',
        user_id: BOT_ID,
        message: '',
        post_type: PostTypeKarelJS,
        user: null,
        props: {
            node_id: node.id,
            node_name: node.name,
        },
    };
}

export const nextTopicMessage = (node: NodeWithResources): Post => {
    return {
        id: '',
        user_id: BOT_ID,
        message: `## Topic\n${node.name}\n ### Description\n ${node.description}\n`,
        post_type: PostTypeTopic,
        user: null,
        props: {
            node_id: node.id,
        },
    };
}

export const nextVideoMessage = (node: NodeWithResources, state: NodeViewState): Post => {
    let videoIndex = state.videoIndex + 1;
    if (node.videos && state.videoIndex + 1 >= node.videos.length) {
        videoIndex = Math.floor(Math.random() * node.videos.length);
    }
    return {
        id: '',
        user_id: BOT_ID,
        message: "Here's the video on the topic:\n",
        post_type: PostTypeVideo,
        user: null,
        props: {
            node_id: node.id,
            video_index: videoIndex,
            video_key: node.videos[videoIndex].key,
            start: node.videos[videoIndex].start,
            length: node.videos[videoIndex].length,
        },
    };
}


export const nextTextMessage = (node: NodeWithResources, state: NodeViewState): Post => {
    let textIndex = state.textIndex + 1;
    if (node.texts && state.textIndex + 1 >= node.texts.length) {
        textIndex = Math.floor(Math.random() * node.texts.length);
    }
    return {
        id: '',
        user_id: BOT_ID,
        message: node.texts[textIndex].text,
        post_type: PostTypeText,
        user: null,
        props: {
            node_id: node.id,
            text_index: textIndex,
        },
    };
}

export const nextTestMessage = (node: NodeWithResources, state: NodeViewState): Post => {
    let testIndex = state.testIndex + 1;
    if (state.textIndex + 1 >= node.questions.length) {
        testIndex = Math.floor(Math.random() * node.questions.length);
    }
    return {
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
    };
}

export const theVeryLastMessage = (username: string): Post => {
    return {
        id: '',
        user_id: BOT_ID,
        message:`Hey ${username}, this was the last topic I had for you. I hope you enjoyed it and learned something new. 🤓 I'm working hard on the next topics and will let you know when they are ready. 🚀 You can still ask me questions regarding previous topics.`,
        post_type: '',
        user: null,
        props: {},
    };
}
