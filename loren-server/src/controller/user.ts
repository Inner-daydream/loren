import { UserService, InvalidEmail, PasswordTooShort } from '../services/user';
import { Request, Response, NextFunction } from 'express';
const create = async (req: Request, res: Response, next: NextFunction) => {
    // parse json from body
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
        res.status(400).json({ error: 'Missing fields' });
        return;
    }
    try {
        await UserService.create(email, password, role);
        res.sendStatus(201);
    } catch (e) {
        if (e instanceof InvalidEmail) {
            res.status(400).json({ error: 'Invalid email' });
        } else if (e instanceof PasswordTooShort) {
            res.status(400).json({ error: 'Password too short' });
        } else {
            res.status(500);
        }
    }
}

export const UserController = {
    create,
};