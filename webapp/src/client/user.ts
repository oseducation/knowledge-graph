import {Graph} from "../types/graph";
import {OnboardingState} from "../types/onboarding";
import {TutorPersonality} from "../types/tutor_personalities";
import {Preference, User, UserCode, UserInteraction, UserNote, UserWithNodeCount} from "../types/users";

import {Rest} from "./rest";

export class UserClient {
    rest: Rest;

    constructor(rest: Rest) {
        this.rest = rest;
    }

    getUsersRoute() {
        return `${this.rest.getBaseRoute()}/users`;
    }

    getUserRoute(userID: string) {
        return `${this.getUsersRoute()}/${userID}`;
    }

    getUserPreferencesRoute(userID: string) {
        return `${this.getUsersRoute()}/${userID}/preferences`;
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
            {method: 'post', body: JSON.stringify({user})},
        );
    }

    registerFromOnboarding = async (user: User, onboarding: OnboardingState) => {
        onboarding.questions = [];
        return this.rest.doFetch<User>(
            `${this.getUsersRoute()}/register`,
            {method: 'post', body: JSON.stringify({
                user: user,
                onboarding: onboarding
            })},
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

        this.rest.me = data
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

    getMyPreferences = async () => {
        const {data} = await this.rest.doFetchWithResponse<Preference[]>(
            `${this.getUserPreferencesRoute(this.rest.me.id)}`,
            {method: 'get'},
        );

        return data;
    }

    saveMyPreferences = async (preferences: Preference[]) => {
        const {data} = await this.rest.doFetchWithResponse<Preference[]>(
            `${this.getUserPreferencesRoute(this.rest.me.id)}`,
            {method: 'put', body: JSON.stringify(preferences)},
        );

        return data;
    }

    getUsersWithNodeCount = async () => {
        const {data} = await this.rest.doFetchWithResponse<UserWithNodeCount[]>(
            `${this.getUsersRoute()}`,
            {method: 'get'},
        );

        return data;
    };

    getGraphForUser = async (userID: string) => {
        const {data} = await this.rest.doFetchWithResponse<Graph>(
            `${this.getUsersRoute()}/graph?user_id=${userID}`,
            {method: 'get'},
        );

        return data;
    };

    getMyCodes = async (nodeID: string) => {
        const {data} = await this.rest.doFetchWithResponse<UserCode[]>(
            `${this.getUsersRoute()}/code?node_id=${nodeID}`,
            {method: 'get'},
        );

        return data;
    };

    saveMyCode = async (nodeID: string, name: string, code: string) => {
        const {data} = await this.rest.doFetchWithResponse(
            `${this.getUsersRoute()}/code?node_id=${nodeID}`,
            {method: 'post', body: JSON.stringify({
                user_id: this.rest.me.id,
                node_id: nodeID,
                code_name: name,
                code: code
            } as UserCode)},
        );

        return data;
    };

    updateMyCode = async (nodeID: string, name: string, code: string) => {
        const {data} = await this.rest.doFetchWithResponse(
            `${this.getUsersRoute()}/code?node_id=${nodeID}`,
            {method: 'put', body: JSON.stringify({
                user_id: this.rest.me.id,
                node_id: nodeID,
                code_name: name,
                code: code
            } as UserCode)},
        );

        return data;
    };

    saveInteraction = async (interaction: UserInteraction) => {
        return this.rest.doFetch<string>(
            `${this.rest.getBaseRoute()}/interactions`,
            {method: 'post', body: JSON.stringify(interaction)},
        );
    }

    getTutorPersonalities = async () => {
        const {data} = await this.rest.doFetchWithResponse<TutorPersonality[]>(
            `${this.rest.getBaseRoute()}/tutor-personalities`,
            {method: 'get'},
        );

        return data;
    }

    getNotes = async (userID: string) => {
        const {data} = await this.rest.doFetchWithResponse<UserNote[]>(
            `${this.rest.getBaseRoute()}/notes/users/${userID}`,
            {method: 'get'},
        );

        return data;
    }

    getNote = async (noteID: string) => {
        const {data} = await this.rest.doFetchWithResponse<UserNote>(
            `${this.rest.getBaseRoute()}/notes/${noteID}`,
            {method: 'get'},
        );

        return data;
    }

    CreateNote = async (note: UserNote) => {
        const {data} = await this.rest.doFetchWithResponse<UserNote>(
            `${this.rest.getBaseRoute()}/notes`,
            {method: 'post', body: JSON.stringify(note)},
        );

        return data;
    }

    DeleteNote = async (noteID: string) => {
        const {data} = await this.rest.doFetchWithResponse<string>(
            `${this.rest.getBaseRoute()}/notes/${noteID}`,
            {method: 'delete'},
        );

        return data;
    }

    UpdateNote = async (note: UserNote) => {
        const {data} = await this.rest.doFetchWithResponse<string>(
            `${this.rest.getBaseRoute()}/notes`,
            {method: 'put', body: JSON.stringify(note)},
        );

        return data;
    }

    ResetPasswordSend = async (email: string) => {
        const {data} = await this.rest.doFetchWithResponse<string>(
            `${this.getUsersRoute()}/password/reset/send`,
            {method: 'post', body: JSON.stringify({email})},
        );

        return data;
    }

    ResetUserPassword = async (token: string, newPassword: string) => {
        const {data} = await this.rest.doFetchWithResponse<string>(
            `${this.getUsersRoute()}/password/reset`,
            {method: 'post', body: JSON.stringify({token, new_password: newPassword})},
        );

        return data;
    }
}
