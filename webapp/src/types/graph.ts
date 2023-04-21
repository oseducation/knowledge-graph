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
