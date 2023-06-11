import {User} from "../types/users";

import {Rest} from "./rest";

export class UserClient {
    rest: Rest;

    constructor(rest: Rest) {
        this.rest = rest;
    }

    getUsersRoute() {
        return `${this.rest.getBaseRoute()}/users`;
    }

    getUserRoute(userId: string) {
        return `${this.getUsersRoute()}/${userId}`;
    }

    login = async (email: string, password: string) => {
        const body: any = {
            email,
            password,
        };

        const {
            data: profile,
        } = await this.rest.doFetchWithResponse<User>(
            `${this.getUsersRoute()}/login`,
            {method: 'post', body: JSON.stringify(body)},
        );

        return profile;
    };

    register = async (user: User) => {
        return this.rest.doFetch<User>(
            `${this.getUsersRoute()}/register`,
            {method: 'post', body: JSON.stringify(user)},
        );
    }

    logout = async () => {
        const {response} = await this.rest.doFetchWithResponse(
            `${this.getUsersRoute()}/logout`,
            {method: 'post'},
        );
        return response;
    };

    getMe = async () => {
        const {data} = await this.rest.doFetchWithResponse<User>(
            `${this.getUsersRoute()}/me`,
            {method: 'get'},
        );

        return data;
    };

    verifyEmail = async (token: string) => {
        const body = {
            token: token
        }
        const {data} = await this.rest.doFetchWithResponse<User>(
            `${this.getUsersRoute()}/email/verify`,
            {method: 'post', body: JSON.stringify(body)},
        );

        return data;
    };
    update = async (user: User) => {
        const {data} = await this.rest.doFetchWithResponse<User>(
            `${this.getUsersRoute()}/me`,
            {method: 'put', body: JSON.stringify(user)},
        );

        return data;
    };
}
