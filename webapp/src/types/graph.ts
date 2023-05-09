export type Node = {
    id: string;
    name: string;
    description: string;
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
    video_type: string;
    key: string;
    length: number;
    node_id: string;
    author_id: string;
}

export type NodeWithResources = {
    id: string;
    name: string;
    description: string;
    videos: Video[];
}