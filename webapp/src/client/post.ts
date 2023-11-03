
import {Post} from "../types/posts";

import {Rest} from "./rest";

export class PostClient{
    rest: Rest;

    constructor (rest: Rest){
        this.rest = rest;
    }

    getPostsRoute() {
        return `${this.rest.getBaseRoute()}/posts`;
    }

    getPostRoute(postID: string) {
        return `${this.getPostsRoute()}/${postID}`;
    }

    getPosts = async (locationID: string, withUsers: boolean) => {
        const params = withUsers ? 'with_users=true&' : '' + `location_id=${locationID}`;
        const data = this.rest.doFetch<Post[]>(`${this.getPostsRoute()}?${params}`, {method: 'get'});
        return data;
    }

    saveBotPost = async (post: Post, locationID: string) => {
        const {data} = await this.rest.doFetchWithResponse<Post>(
            `${this.getPostsRoute()}`,
            {method: 'post', body: JSON.stringify({
                user_id: post.user_id,
                location_id: locationID,
                message: post.message,
                post_type: post.post_type,
                props: post.props,
            })},
        );

        return data;
    };

    saveUserPost = async (message: string, locationID: string) => {
        const {data} = await this.rest.doFetchWithResponse<Post>(
            `${this.getPostsRoute()}`,
            {method: 'post', body: JSON.stringify({
                user_id: this.rest.me.id,
                location_id: locationID,
                message: message,
            })},
        );

        return data;
    };
}
