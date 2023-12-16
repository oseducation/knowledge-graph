export type FinishedNodes = {
    finished_nodes: number;
    finished_nodes_this_week: number;
}

export type ActivityToday = {
    nodes_finished_today: number;
    nodes_started_today: number;
    nodes_watched_today: number;
}

export type Progress = {
    [date: string]: number;
}

export type Steak = {
    current_steak: number;
    max_steak: number;
    today: boolean
}

export type AITutorNumberOfPosts = {
    bot_posts_month: number;
    bot_posts_week: number;
    max_posts: number;
}
