import {NodeStatusFinished, NodeWithResources} from "../types/graph";

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

    markAsKnown = async (nodeID: string, userID: string) => {
        const status = {
            node_id: nodeID,
            user_id: userID,
            status: NodeStatusFinished
        }
        try {
            this.rest.doPut(`${this.getNodeRoute(nodeID)}/status`, JSON.stringify(status));
        } catch (error) {
            return {error};
        }
    }
}
