import {Graph} from "../types/graph";

import {Rest} from "./rest";

export class GraphClient{
    rest: Rest;

    constructor (rest: Rest){
        this.rest = rest;
    }

    getGraphRoute() {
        return `${this.rest.getBaseRoute()}/graph`;
    }

    getGoalsRoute() {
        return `${this.rest.getBaseRoute()}/goals`;
    }

    getGoalsForUserRoute(userID: string) {
        return `${this.getGoalsRoute()}/${userID}`;
    }

    get = async () => {
        if (!this.rest.me || !this.rest.me.id){
            return null;
        }
        const data = this.rest.doFetch<Graph>(`${this.getGraphRoute()}`, {method: 'get'});
        return data;
    };

    getGoal = async() => {
        if (!this.rest.me || !this.rest.me.id){
            return '';
        }
        const url = `${this.getGoalsForUserRoute(this.rest.me.id)}`;
        const data = this.rest.doFetch<string>(url, {method: 'get'});
        return data;
    }

    updateGoal = async(nodeID: string) => {
        if (!this.rest.me || !this.rest.me.id){
            return '';
        }
        const url = `${this.getGoalsForUserRoute(this.rest.me.id)}/nodes/${nodeID}`;
        const data = this.rest.doFetch<string>(url, {method: 'post'});
        return data;
    }
}
