import DefaultResponse from '../responses';

export function errorHandler() {
    return (error: any, request: any, response: any, next: any) => {
        // Error handling middleware functionality
        const status = error.status || 400;
        // send back an easily understandable error message to the caller
        response.status(status).json(new DefaultResponse(true, error.message));
    }
}