import {Post, PostType, PostTypeKarelJS, PostTypeTest, PostTypeText, PostTypeTopic, PostTypeVideo} from '../../types/posts';
import {NodeWithResources} from '../../types/graph';
import {User} from '../../types/users';

import {BOT_ID} from './ai_tutor_chat';
import {getActions, letsStartAction, nextKarelJSMessage, nextTextMessage, nextTopicMessage, nextVideoMessage, theVeryFirstMessage, theVeryLastMessage} from './messages';


const getNodeViewState = (posts: Post[], nodeID: string) => {
    let index = posts.length - 1;
    let videoIndex = -1;
    let textIndex = -1;
    let testIndex = -1;
    while (index >= 0) {
        if (posts[index].props &&
            posts[index].props.node_id &&
            posts[index].props.node_id === nodeID) {
            if (posts[index].post_type === PostTypeVideo) {
                if (posts[index].props.video_index !== undefined && posts[index].props.video_index > videoIndex) {
                    videoIndex = posts[index].props.video_index;
                }
            } else if (posts[index].post_type === PostTypeText) {
                if (posts[index].props.text_index !== undefined && posts[index].props.text_index > textIndex) {
                    textIndex = posts[index].props.text_index;
                }
            } else if (posts[index].post_type === PostTypeTest) {
                if (posts[index].props.test_index !== undefined && posts[index].props.test_index > testIndex) {
                    testIndex = posts[index].props.test_index;
                }
            }
        }
        index--;
    }
    return {
        videoIndex,
        textIndex,
        testIndex
    }
}

const getNextContent = (posts: Post[], node: NodeWithResources, contentType: string):Post => {
    const nodeViewState = getNodeViewState(posts, node.id);
    if (contentType === PostTypeVideo) {
        return nextVideoMessage(node, nodeViewState);
    } else if (contentType === PostTypeText) {
        return nextTextMessage(node, nodeViewState);
    } else if (contentType === PostTypeTopic) {
        return nextTopicMessage(node);
    } else if (contentType === PostTypeKarelJS){
        return nextKarelJSMessage(node);
    } else {
        return nextVideoMessage(node, nodeViewState);
    }
}

export const constructBotPost = (posts: Post[], node: NodeWithResources | null, user: User, postType: PostType): Post | null => {
    if (posts.length === 0) {
        return theVeryFirstMessage(user!.username);
    }
    const lastPost = posts[posts.length - 1];
    if (lastPost.user_id === BOT_ID) {
        return null;
    }

    if (!node) {
        return theVeryLastMessage(user!.username);
    } else {
        return getNextContent(posts, node, postType);
    }
}

export const getBotPostActions = (posts: Post[] | null, node: NodeWithResources) => {
    if (!posts || !node) {
        return [];
    }
    if (posts.length === 0) {
        return [letsStartAction];
    }
    if (posts.length === 1 && posts[0].user_id === BOT_ID) {
        return [letsStartAction];
    }
    if (posts[posts.length - 1].user_id !== BOT_ID) {
        return [];
    }
    const nodeViewState = getNodeViewState(posts, node.id);
    const actions = getActions(nodeViewState, node);

    return actions;
}
