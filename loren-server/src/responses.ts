export default class DefaultResponse {
    isError: boolean;
    message: string

    constructor(isError: boolean, message: string) {
        this.isError = isError;
        this.message = message;
    }
}

export type jsonResponse = {
    error?: string,
    message?: string,
    debug?: any
}