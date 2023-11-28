import {User} from "./users"

export const NodeStatusStarted  = "started"
export const NodeStatusWatched  = "watched"
export const NodeStatusFinished = "finished"
export const NodeStatusNext     = "next"
export const NodeStatusUnseen   = "unseen"

export const VideoStatusStarted = "video_status_started"
export const VideoStatusAbandoned = "video_status_abandoned"
export const VideoStatusFinished = "video_status_finished"

export const NodeTypeLecture = 'lecture'
export const NodeTypeExample = 'example'
export const NodeTypeAssignment = 'assignment'
export const NodeTypeParent = 'parent'

export type Node = {
    id: string;
    name: string;
    description: string;
    node_type: string;
    status: string;
}

export type Link = {
    source: string;
    target: string;
}

export type Graph = {
    nodes: Node[];
    links: Link[];
};

export type Video = {
    id: string;
    created_at: number;
    deleted_at: number;
    name: string;
    video_type: string;
    key: string;
    length: number;
    node_id: string;
    author_id: string;
    author_username: string;
}

export type Text = {
    id: string;
    created_at: number;
    updated_at: number;
    deleted_at: number;
    name: string;
    text: string;
    node_id: string;
    author_id: string;
    author_username: string;
}

export type QuestionChoice = {
    id: string;
    choice: string;
    is_right_choice: boolean;
}

export type Question = {
    id: string;
    name: string;
    question: string;
    question_type: string;
    node_id: string;
    choices: QuestionChoice[];
}

export type NodeWithResources = {
    id: string;
    name: string;
    description: string;
    status: string;
    environment: string;
    videos: Video[];
    active_users: User[];
    texts: Text[];
    questions: Question[];
    prerequisites: Node[];
}

export type NodeViewState = {
    videoIndex: number;
    textIndex: number;
    testIndex: number;
}

export const cloneGraph = (graph: Graph): Graph => {
    return {
        nodes: structuredClone(graph.nodes),
        links: structuredClone(graph.links)
    }
}

export const getVideoLength = (length: number) => {
    const minutes = Math.floor(length/60);
    const seconds = length - minutes * 60;
    if (seconds > 9) {
        return "" + minutes + ":" + seconds;
    }
    return "" + minutes + ":0" + seconds;
}

// We are doing this because in graph component graph object is changed and links
// are of type Node not string
export const castToLink = (link: Link): Link => {
    let sourceID = link.source
    let targetID = link.target
    if (typeof link.source !== 'string' && typeof link.target !== 'string') {
        sourceID = (link.source as Node).id;
        targetID = (link.target as Node).id;
    }
    return {
        source: sourceID,
        target: targetID
    }
}


export type Goal = {
    node_id: string;
}
