import {User} from "../types/users";
import {Rest} from "./rest";

export class UserClient{
    rest: Rest;

    constructor (rest: Rest){
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
            headers,
        } = await this.rest.doFetchWithResponse<User>(
            `${this.getUsersRoute()}/login`,
            {method: 'post', body: JSON.stringify(body)},
        );

        if (headers.has('Token')) {
            this.rest.setToken(headers.get('Token')!);
        }

        return profile;
    };

    register = async(user: User) => {
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

        if (response.ok) {
            this.rest.setToken('');
        }

        return response;
    };
}