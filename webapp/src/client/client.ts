import {Rest} from "./rest";
import {UserClient} from "./user";


class Client {
    rest: Rest;
    user: UserClient;

    constructor(){
        this.rest = new Rest()
        this.user = new UserClient(this.rest);
    }

    User(){
        return this.user;
    }
}

const ClientObject = new Client();

export {
    ClientObject as Client
}
