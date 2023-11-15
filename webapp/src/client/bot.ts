
import {Post} from "../types/posts";

import {Rest} from "./rest";

export class BotClient{
    rest: Rest;

    constructor (rest: Rest){
        this.rest = rest;
    }

    getBotsRoute() {
        return `${this.rest.getBaseRoute()}/bots`;
    }

    createFirstPosts = async () => {
        const data = this.rest.doFetch<Post[]>(`${this.getBotsRoute()}/first`, {method: 'post'});
        return data;
    }

    askQuestion = async (post: Post) => {
        const {data} = await this.rest.doFetchWithResponse<Post>(
            `${this.getBotsRoute()}/ask`,
            {method: 'post', body: JSON.stringify(post)},
        );

        return data;
    }
}
