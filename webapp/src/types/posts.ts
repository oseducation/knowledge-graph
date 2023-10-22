import {User} from "./users";

export type Post = {
    id: string;
    message: string;
    user: User;
}
