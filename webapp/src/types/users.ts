export type User = {
    id: string;
    createAt: number;
    updateAt: number;
    deleteAt: number;
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string;
    lastPasswordUpdate: number;
    props: Record<string, string>;
};
