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
    plan: Plan;
};

export type Plan = {
    name: string;
    number_of_questions_daily: number;
    chat_gpt_version: string;
    price: string;
    url: string
}

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

export const PLANS = {
    'Free': 'free',
    'Premium': 'premium'
};

export type DagMode = 'td' | 'bu' | 'lr' | 'rl' | 'radialout' | 'radialin';

export type UserPreferences = {
    language: string;
    is_video_looped: boolean;
    graph_direction: DagMode;
    legend_on_graph_message: boolean;
    legend_on_topic_graph: boolean;
}

export const UserPreferencesDefaultValues: UserPreferences = {
    language: 'ge',
    is_video_looped: false,
    graph_direction: 'td',
    legend_on_graph_message: true,
    legend_on_topic_graph: true,
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

export type PerformerUser = {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    finished_count: number;
};
