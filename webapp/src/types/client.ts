export type ClientResponse<T> = {
    response: Response;
    headers: Map<string, string>;
    data: T;
};

export type Options = {
    headers?: { [x: string]: string };
    method?: string;
    url?: string;
    credentials?: 'omit' | 'same-origin' | 'include';
    body?: any;
};
