import {Link} from "../../types/graph";

type AdjacencyList = { [key: string]: string[] };

const buildAdjacencyList = (links: Link[]): AdjacencyList => {
    const adjacencyList: AdjacencyList = {};
    links.forEach(({ source, target }) => {
        if (!adjacencyList[source]) {
            adjacencyList[source] = [];
        }
        if (!adjacencyList[target]) {
            adjacencyList[target] = [];
        }
        adjacencyList[source].push(target);
    });
    return adjacencyList;
};

export const findCycles = (links: Link[]): string[][] => {
    const adjacencyList = buildAdjacencyList(links);
    const visited: Set<string> = new Set();
    const stack: Set<string> = new Set();
    const result: string[][] = [];

    const dfs = (node: string, path: string[]): void => {
        if (stack.has(node)) {
            // Cycle detected
            const cycleStartIndex = path.indexOf(node);
            const cycle = path.slice(cycleStartIndex);
            result.push(cycle);
            return;
        }

        if (visited.has(node)) {
            return;
        }

        visited.add(node);
        stack.add(node);

        const neighbors = adjacencyList[node];
        for (const neighbor of neighbors) {
            dfs(neighbor, [...path, neighbor]);
        }

        stack.delete(node);
    };

    for (const node in adjacencyList) {
        if (!visited.has(node)) {
            dfs(node, [node]);
        }
    }

    return result;
};

export const findRedundantLinks = (links: Link[]): Link[] => {
    const result = [];
    for (let i=0; i<links.length; i++) {
        const linksClone = clone(links);
        const temp = linksClone[i].target;
        linksClone[i].target = linksClone[i].source;
        linksClone[i].source = temp;
        const cycles = findCycles(linksClone);
        if (cycles.length > 0) {
            result.push(links[i]);
            console.log('Cycle found:', cycles, links[i])
        }
    }
    return result
}

const clone = (obj: any): any => {
    return JSON.parse(JSON.stringify(obj));
}
