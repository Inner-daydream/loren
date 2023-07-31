export class MissingFilds extends Error {
    status: number
    constructor() {
        super('Fild is missing');
        this.status = 400;
    }
}