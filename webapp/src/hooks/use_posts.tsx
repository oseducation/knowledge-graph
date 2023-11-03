import {useState, useEffect} from 'react'

import {Post} from '../types/posts';
import {Client} from '../client/client';
import {BOT_ID} from '../components/bot/chat';

import useAuth from './useAuth';

export default function usePosts() {
    const [posts, setPosts] = useState<Post[] | null>(null);
    const {user} = useAuth();

    useEffect(() => {
        if (user) {
            const locationID = `${user!.id}_${BOT_ID}`
            Client.Post().getPosts(locationID, false).then((posts) => {
                setPosts(posts);
            });
        }
    }, [])

    return {posts, setPosts};
}
