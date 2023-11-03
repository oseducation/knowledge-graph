import {useState, useEffect, useRef} from 'react'

import {Action, Post, PostWithActions} from '../types/posts';
import {Client} from '../client/client';
import {BOT_ID} from '../components/bot/chat';
import {nextVideoMessage, theVeryFirstMessage, theVeryLastMessage} from '../components/bot/messages';

import useAuth from './useAuth';


export default function createPost(posts: Post[] | null, nextNodeID: string | null, shouldCreateNewPost: boolean) {
    const [post, setPost] = useState<Post | null>(null);
    const [actions, setActions] = useState<Action[]>([]);
    const shouldCreatePost = useRef(true);
    const {user} = useAuth();
    console.log('createPost', posts, nextNodeID, shouldCreateNewPost)

    const savePost = (postWithActions: PostWithActions, locationID: string) => {
        if ((posts && posts?.length === 0) || (posts && postWithActions.post.message !== posts[posts.length-1].message)) {
            Client.Post().saveBotPost(postWithActions.post, locationID).then((post) => {
                setPost(post);
                setActions(postWithActions.actions);
            });
        }
    }

    const create = () => {
        if (!user) {
            return;
        }
        if (!posts) {
            return;
        }
        const locationID = `${user!.id}_${BOT_ID}`
        if (posts.length === 0) {
            const postWithActions = theVeryFirstMessage(user!.username);
            savePost(postWithActions, locationID);
            return;
        }
        if (posts[posts.length - 1].user_id === BOT_ID) {
            return;
        }

        if (nextNodeID === "") {
            const postWithActions = theVeryLastMessage(user!.username);
            savePost(postWithActions, locationID);
            return;

        }

        if (nextNodeID) {
            const postWithActions = nextVideoMessage(nextNodeID, 0); // ToDo save state in DB or at least in the frontend
            savePost(postWithActions, locationID);
        }
    }

    useEffect(() => {
        create();
    }, [shouldCreateNewPost, nextNodeID])

    return {post, actions, setPost, setActions}
}
