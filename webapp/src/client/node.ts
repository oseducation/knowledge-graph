import {Analytics} from "../analytics";
import {NodeStatusFinished, NodeStatusStarted, NodeStatusWatched, NodeWithResources} from "../types/graph";

import {Rest} from "./rest";

declare const gtag: Gtag.Gtag;

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
        gtag('event', 'learn', {
            status: 'know',
            node: nodeID
        });
        Analytics.learnTopic({
            'node_id': nodeID
        })
        return this.changeStatus(nodeID, userID, NodeStatusFinished);
    }

    markAsStarted = async (nodeID: string, userID: string) => {
        gtag('event', 'learn', {
            status: 'started',
            node: nodeID
        });
        Analytics.startTopic({
            'node_id': nodeID
        })
        return this.changeStatus(nodeID, userID, NodeStatusStarted);
    }

    markAsWatched = async (nodeID: string, userID: string) => {
        gtag('event', 'learn', {
            status: 'watched',
            node: nodeID
        });
        Analytics.watchTopic({
            'node_id': nodeID
        })
        return this.changeStatus(nodeID, userID, NodeStatusWatched);
    }

    changeStatus = async (nodeID: string, userID: string, newStatus: string) => {
        const status = {
            node_id: nodeID,
            user_id: userID,
            status: newStatus
        }
        try {
            await this.rest.doPut(`${this.getNodeRoute(nodeID)}/status`, JSON.stringify(status));
        } catch (error) {
            return {error};
        }
    }

    addVideoToNode = async (nodeID: string, videoID: string) => {
        const data = this.rest.doFetch<NodeWithResources>(`${this.getNodeRoute(nodeID)}/video/${videoID}`, {method: 'post'});
        return data;
    }
}
