import { PrismaClient } from "@prisma/client";
import { ManagementClient } from 'auth0';
import isEmail from 'validator/lib/isEmail';
import { v4 as uuidv4 } from 'uuid';
import { ROLES } from './constants';
const prisma = new PrismaClient();
const management = new ManagementClient({
    domain: process.env.AUTH0_DOMAIN as string,
    token: process.env.AUTH0_TOKEN as string,
});
export class PasswordTooShort extends Error {
    constructor() {
        super('Password too short');
    }
}
export class InvalidEmail extends Error {
    constructor() {
        super('Invalid email');
    }
}
export class UserAlreadyExists extends Error {
    constructor() {
        super('User already exists');
    }
}

const create = async (email: string, password: string, role: string): Promise<void> => {
    // TODO: Properly assign roles based permissions
    if (password.length < 12) {
        throw new PasswordTooShort();
    }
    if (!isEmail(email)) {
        throw new InvalidEmail();
    }

    // await prisma.user.findFirst({
    //     where: {
    //         email: email,
    //     },
    // });
    const id = uuidv4();
    try {
        await management.createUser({
            connection: process.env.AUTH0_CONNECTION as string,
            email: email,
            password: password,
            user_id: id,
            app_metadata: {
                role: [ROLES.ADMIN],
            },
        });
    } catch (e) {
        if (e.statusCode === 409) {
            throw new UserAlreadyExists();
        }
        throw e;
    }
    try {
        await prisma.user.create({
            data: {
                id: id,
                email: email,
                role: role,
            },
        });
    } catch (e) {
        console.log(e);
        throw e;
    }
};

export const UserService = {
    create,
};