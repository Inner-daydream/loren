import { UserService, InvalidEmail, PasswordTooShort } from '../services/user';
import { ROLES } from './../services/constants';
import { MissingFilds } from './Exceptions/MissingFildsException';
const create = async (req: any, res: any, next: any) => {
    // parse json from body
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new MissingFilds());
    }
    try {
        await UserService.create(email, password, ROLES.ADMIN);
        res.sendStatus(201);
    } catch (e) {
        next(e)
    }
}

export const UserController = {
    create,
};