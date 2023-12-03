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
    lang: string;
};

export type UserWithNodeCount = {
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
    finished_node_count: number;
    in_progress_node_count: number;
};

export const ROLES = {
    'Admin': 'admin',
    'User': 'user'
};

export type DagMode = 'td' | 'bu' | 'lr' | 'rl' | 'radialout' | 'radialin';

export type UserPreferences = {
    language: string;
    is_video_looped: boolean;
    graph_direction: DagMode;
}

export const UserPreferencesDefaultValues: UserPreferences = {
    language: 'ge',
    is_video_looped: false,
    graph_direction: 'td'
}

export type Preference = {
    user_id: string;
    key: string;
    value: string;
}

export type UserCode = {
    user_id: string;
    node_id: string;
    code_name: string;
    code: string;
}

export type UserInteraction = {
    id: string;
    user_id: string;
    start_date: number;
    end_date: number;
    url: string;
    ui_component_name: string;
    tag: string;
}
