export type ServerError = {
    type?: string;
    server_error_id?: string;
    stack?: string;
    message: string;
    status_code?: number;
    url?: string;
};
