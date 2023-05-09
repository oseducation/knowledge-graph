import {NodeWithResources} from "../types/graph";

import {Rest} from "./rest";

export class NodeClient{
    rest: Rest;

    constructor (rest: Rest){
        this.rest = rest;
    }

    getNodesRoute() {
        return `${this.rest.getBaseRoute()}/nodes`;
    }

    getNodeRoute(nodeID: string) {
        return `${this.getNodesRoute()}/${nodeID}`;
    }

    get = async (nodeID: string) => {
        const data = this.rest.doFetch<NodeWithResources>(`${this.getNodeRoute(nodeID)}`, {method: 'get'});
        return data;
    };
}
