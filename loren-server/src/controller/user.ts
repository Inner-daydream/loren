import { NextFunction, Request, Response } from 'express';
import { UserService } from '../services/user';
import { ROLES } from '../constants';
import { MissingFields } from '../exceptions';

const create = async (req: Request, res: Response, next: NextFunction) => {
    // parse json from body
    const { email, password, joinCode } = req.body;
    if (!email || !password) {
        return next(new MissingFields());
    }
    try {
        await UserService.create(email, password, joinCode);
        res.sendStatus(201);
    } catch (e) {
        next(e)
    }
}

export const UserController = {
    create,
};