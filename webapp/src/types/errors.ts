export type ServerError = {
    type?: string;
    serverErrorID?: string;
    stack?: string;
    message: string;
    statusCode?: number;
    url?: string;
};
