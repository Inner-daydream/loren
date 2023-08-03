import e, { NextFunction, Request, Response } from 'express';
import { UserService } from '../services/user';
import zod from 'zod';


const CreateSchema = zod.object({
    email: zod.string(),
    password: zod.string(),
    joinCode: zod.optional(zod.string()),
});

const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        CreateSchema.parse(req.body);
    } catch (e) {
        next(e);
        return;
    }
    const { email, password, joinCode } = req.body;
    try {
        await UserService.create(email, password, joinCode);
        res.status(201).json({
            message: 'User created successfully',
        });
    } catch (e) {
        next(e)
    }
}

export const UserController = {
    create,
};