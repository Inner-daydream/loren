import { InvalidInvite, PasswordTooShort, InvalidEmail, UserAlreadyExists, UserNotFound } from "./services/user";
import { PaymentUnavailableError, CheckoutError } from "./services/payment";
import { SchoolAlreadyExist, UserAlreadyHasASchool, PhoneNumberIsNotValid } from "./services/school";

import { logger } from "./logger";
import { SIGNAL } from "./constants";
import { exit } from "process";
import { Response } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
    public isImportant: boolean
    constructor(message: string, isImportant: boolean = false) {
        super(message);
        this.isImportant = isImportant;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}

export class ApiError extends Error {
    readonly status: number
    readonly isCatastrophic: boolean
    readonly id: number
    constructor(message: string, status: number, id: number, isCatastrophic: boolean = false) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.status = status;
        this.isCatastrophic = isCatastrophic;
        this.id = id;
        Error.captureStackTrace(this);
    }
}

const buildZodErrorMessage = (error: ZodError): string => {
    const errors = error.errors.map((e) => {
        return `${e.path.join('.')}: ${e.message}`;
    });
    return errors.join(', ');
}

const mapError = (error: Error): Error | undefined => {
    switch (error.constructor) {
        case InvalidInvite:
            return new ApiError('Invalid join code', 400, 1);
        case PasswordTooShort:
            return new ApiError('Password too short', 400, 2);
        case InvalidEmail:
            return new ApiError('Invalid email', 400, 3);
        case UserAlreadyExists:
            return new ApiError('User already exists', 400, 4);
        case UserNotFound:
            return new ApiError('User not found', 404, 5);
        case SyntaxError:
            return new ApiError('Invalid JSON', 400, 7);
        case ZodError:
            return new ApiError(buildZodErrorMessage(error as ZodError), 400, 8);
        case PaymentUnavailableError:
            return new ApiError('Payment service unavailable', 503, 9);
        case CheckoutError:
            return new ApiError('An issue occurred during checkout', 500, 10);
        case SchoolAlreadyExist:
            return new ApiError('School already exists', 400, 11);
        case UserAlreadyHasASchool:
            return new ApiError('User already has a school', 400, 12);
        case PhoneNumberIsNotValid:
            return new ApiError('Given phone number was not valid', 400, 13);
        default:
            return undefined;
    }
}
const fireMetrics = (error: Error, level: string) => {
    // TODO: implement
}
const notify = (error: Error) => {
    // TODO: implement
}
const enum ERROR_LEVEL {
    IMPORTANT = 'IMPORTANT',
    FATAL = 'FATAL',
    OPERATIONAL = 'OPERATIONAL',
}
export const errorHandler = (error: Error, res?: Response) => {
    let errorLogged = false;
    if (error instanceof AppError && error.isImportant) {
        logger.error(error.message);
        logger.error(error.stack);
        fireMetrics(error, ERROR_LEVEL.IMPORTANT);
        notify(error);
        errorLogged = true;
    }
    const userError = mapError(error);
    if (userError) {
        if (userError instanceof ApiError) {
            res?.status(userError.status).json({ error: userError.message, id: userError.id });
            userError.isCatastrophic && handleFatalError(userError);
        }
        if (!errorLogged) {
            fireMetrics(error, ERROR_LEVEL.OPERATIONAL);
            logger.debug(error.message);
            logger.trace(error.stack);
        }

    } else {
        res?.status(500).json({ error: 'Internal server error' });
        handleFatalError(error);
    }
};

export const handleFatalError = async (error: Error) => {
    logger.fatal(error.message);
    logger.fatal(error.stack);
    fireMetrics(error, ERROR_LEVEL.FATAL);
    notify(error);
    process.emit(SIGNAL.SIGTERM);
    await new Promise(r => setTimeout(r, 15000));
    logger.fatal('graceful shutdown failed, exiting');
    exit(1);
}