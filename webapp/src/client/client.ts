import {Rest} from "./rest";
import {UserClient} from "./user";
import {GraphClient} from "./graph";


class Client {
    rest: Rest;
    user: UserClient;
    graph: GraphClient;

    constructor(){
        this.rest = new Rest()
        this.user = new UserClient(this.rest);
        this.graph = new GraphClient(this.rest);
    }

    User(){
        return this.user;
    }

    Graph(){
        return this.graph;
    }
}

const ClientObject = new Client();

export {
    ClientObject as Client
}
