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

    get = async () => {
        const data = this.rest.doFetch<Graph>(`${this.getGraphRoute()}`, {method: 'get'});
        return data;
    };
}
