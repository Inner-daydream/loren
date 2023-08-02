import { InvalidJoinCode } from "./services/user";
import { logger } from "./logger";
import { SIGNAL } from "./constants";
import { exit } from "process";
import { Response } from "express";
export class MissingFields extends Error {
    status: number
    constructor() {
        super('Some fields are missing');
        this.status = 400;
    }
}


export class ApiError extends Error {
    readonly status: number
    readonly isCatastrophic: boolean
    constructor(message: string, status: number, isCatastrophic: boolean = false) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.status = status;
        this.isCatastrophic = isCatastrophic;
        Error.captureStackTrace(this);
    }
}

const mapError = (error: Error): ApiError | undefined => {
    switch (error.constructor) {
        case InvalidJoinCode:
            return new ApiError('Invalid join code', 400);
        default:
            return undefined;
    }
}

export const errorHandler = (error: Error, res?: Response) => {
    const userError = mapError(error);
    if (userError) {
        res?.status(userError.status).json({ error: userError.message });
    } else {
        res?.status(500).json({ error: 'Internal server error' });
        handleFatalError(error);
    }
};

export const handleFatalError = async (error: Error) => {
    logger.fatal(error);
    process.emit(SIGNAL.SIGTERM);
    await new Promise(r => setTimeout(r, 15000));
    logger.fatal('graceful shutdown failed, exiting');
    exit(1);
}