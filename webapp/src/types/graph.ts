export const NodeStatusStarted  = "started"
export const NodeStatusWatched  = "watched"
export const NodeStatusFinished = "finished"
export const NodeStatusNext     = "next"
export const NodeStatusUnseen   = "unseen"

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

export type ActiveUser = {
    user_id: string;
    username: string;
    first_name: string;
    last_name: string;
}

export type NodeWithResources = {
    id: string;
    name: string;
    description: string;
    videos: Video[];
    active_users: ActiveUser[];
}

export const getVideoLength = (length: number) => {
    const minutes = Math.floor(length/60)
    const seconds = length - minutes * 60
    return "" + minutes + ":" + seconds
}
