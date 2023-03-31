export type User = {
    id: string;
    create_at: number;
    update_at: number;
    delete_at: number;
    username: string;
    password: string;
    email: string;
    first_name: string;
    last_name: string;
    roles: string;
    last_password_update: number;
    props: Record<string, string>;
};