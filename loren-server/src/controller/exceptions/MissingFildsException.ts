export class MissingFields extends Error {
    status: number
    constructor() {
        super('Some fields are missing');
        this.status = 400;
    }
}