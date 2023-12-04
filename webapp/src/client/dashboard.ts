import {FinishedNodes} from "../types/dashboard";

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

    getFinishedNodes = async () => {
        if (!this.rest.me || !this.rest.me.id){
            return null;
        }
        const data = this.rest.doFetch<FinishedNodes>(`${this.getFinishedNodesRoute()}`, {method: 'get'});
        return data;
    };
}
