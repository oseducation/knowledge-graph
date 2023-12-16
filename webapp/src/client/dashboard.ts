import {AITutorNumberOfPosts, ActivityToday, FinishedNodes, Progress, Steak} from "../types/dashboard";
import {PerformerUser} from "../types/users";

import {Rest} from "./rest";

export class DashboardClient{
    rest: Rest;

    constructor (rest: Rest){
        this.rest = rest;
    }

    getDashboardRoute() {
        return `${this.rest.getBaseRoute()}/dashboard`;
    }

    getFinishedNodesRoute() {
        return `${this.getDashboardRoute()}/finished_nodes`;
    }

    getTodaysActivityRoute() {
        return `${this.getDashboardRoute()}/todays_activity`;
    }

    getProgressRoute() {
        return `${this.getDashboardRoute()}/progress`;
    }

    getPerformersRoute(days: number, n: number) {
        return `${this.getDashboardRoute()}/performers?days=${days}&n=${n}`;
    }

    getSteakRoute() {
        return `${this.getDashboardRoute()}/steak`;
    }

    getAITutorPostsRoute() {
        return `${this.getDashboardRoute()}/number_of_bot_posts_monthly`;
    }

    getFinishedNodes = async () => {
        if (!this.rest.me || !this.rest.me.id){
            return null;
        }
        const data = this.rest.doFetch<FinishedNodes>(`${this.getFinishedNodesRoute()}`, {method: 'get'});
        return data;
    };

    getTodaysActivity = async () => {
        if (!this.rest.me || !this.rest.me.id){
            return null;
        }
        const data = this.rest.doFetch<ActivityToday>(`${this.getTodaysActivityRoute()}`, {method: 'get'});
        return data;
    };

    getProgress = async () => {
        if (!this.rest.me || !this.rest.me.id){
            return null;
        }
        const data = this.rest.doFetch<Progress>(`${this.getProgressRoute()}`, {method: 'get'});
        return data;
    };

    getPerformers = async (days: number, n: number) => {
        if (!this.rest.me || !this.rest.me.id){
            return null;
        }
        const data = this.rest.doFetch<PerformerUser[]>(`${this.getPerformersRoute(days, n)}`, {method: 'get'});
        return data;
    };

    getSteak = async () => {
        if (!this.rest.me || !this.rest.me.id){
            return null;
        }
        const data = this.rest.doFetch<Steak>(`${this.getSteakRoute()}`, {method: 'get'});
        return data;
    };

    getAITutorPosts = async () => {
        if (!this.rest.me || !this.rest.me.id){
            return null;
        }
        const data = this.rest.doFetch<AITutorNumberOfPosts>(`${this.getAITutorPostsRoute()}`, {method: 'get'});
        return data;
    };
}
