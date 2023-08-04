import { NextFunction, Request, Response } from 'express';
import { UserService } from '../services/user';
import zod from 'zod';


const createSchema = zod.object({
    email: zod.string(),
    password: zod.string(),
    joinCode: zod.optional(zod.string()),
});

const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        createSchema.parse(req.body);
    } catch (e) {
        return next(e);
    }
    const { email, password, joinCode } = req.body;
    try {
        await UserService.create(email, password, joinCode);
        res.status(201).json({
            message: 'User created successfully',
        });
    } catch (e) {
        return next(e)
    }
}

export const UserController = {
    create,
};