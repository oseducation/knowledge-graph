export type User = {
    id: string;
    created_at: number;
    updated_at: number;
    deleted_at: number;
    username: string;
    password: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    last_password_update: number;
    props: Record<string, string>;
};

export const ROLES = {
    'Admin': 'admin',
    'User': 'user'
};
