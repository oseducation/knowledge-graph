import {Rest} from "./rest";
import {UserClient} from "./user";
import {GraphClient} from "./graph";
import {NodeClient} from "./node";
import {SidebarClient} from "./sidebar";


class Client {
    rest: Rest;
    user: UserClient;
    graph: GraphClient;
    node: NodeClient;
    sidebar: SidebarClient;

    constructor(){
        this.rest = new Rest();
        this.user = new UserClient(this.rest);
        this.graph = new GraphClient(this.rest);
        this.node = new NodeClient(this.rest);
        this.sidebar = new SidebarClient(this.rest);
    }

    User(){
        return this.user;
    }

    Graph(){
        return this.graph;
    }

    Node(){
        return this.node;
    }

    Sidebar(){
        return this.sidebar;
    }
}

const ClientObject = new Client();

export {
    ClientObject as Client
}
