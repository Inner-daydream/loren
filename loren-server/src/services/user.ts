import { PrismaClient, User } from "@prisma/client";
import { ManagementClient, User as Auth0User } from 'auth0';
import isEmail from 'validator/lib/isEmail';
import { v4 as uuidv4 } from 'uuid';
import { env } from "../env";
import { ROLES } from '../constants';
import { UserController } from "../controller/user";
const prisma = new PrismaClient();
const management = new ManagementClient({
    domain: env.AUTH0_DOMAIN,
    token: env.AUTH0_TOKEN,
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
    constructor(userID: string, message?: string) {
        message = message || 'User already exists';
        super(message + ': ' + userID);
    }
}
export class InvalidInvite extends Error {
    constructor(code?: string) {
        super('Invalid invite: ' + code);
    }
}
export class UserNotFound extends Error {
    constructor(userID: string, message?: string) {
        message = message || 'User not found';
        super(message + ': ' + userID);
    }
}

const joinSchool = async (userID: string, schoolID: string, role: string): Promise<void> => {
    try {
        await prisma.user.update({
            where: {
                id: userID,
            },
            data: {
                schoolId: schoolID,
            },
        });
    } catch (e) {
        if (e.code === 'P2025') {
            throw new UserNotFound(userID);
        }
        throw e;
    }
    await updateRole(userID, role);
};
const createIDP = async (id: string, email: string, password: string, role?: string): Promise<Auth0User> => {
    try {
        const user = await management.createUser({
            connection: env.AUTH0_CONNECTION,
            email: email,
            password: password,
            user_id: id,
            app_metadata: {
                role: role || ROLES.NONE,
            },
        });
        return user;
    } catch (e) {
        if (e.statusCode === 409) {
            throw new UserAlreadyExists(id, 'User already exists in Auth0');
        }
        throw e;
    }
}

const updateRole = async (id: string, role: string): Promise<void> => {
    try {
        prisma.user.update({
            where: {
                id: id,
            },
            data: {
                role: role,
            },
        });
    } catch (e) {
        if (e.code === 'P2025') {
            throw new UserNotFound(id, 'User not found in the database');
        }
        throw e;
    }
    try {
        await management.updateUser(
            {
                id: id,
            },
            {
                app_metadata: {
                    role: role,
                },
            }
        );
    } catch (e) {
        if (e.statusCode === 404) {
            throw new UserNotFound(id, 'User not found in Auth0');
        }
        throw e;
    }
}
const createDB = async (id: string, email: string): Promise<User> => {
    try {
        const user = await prisma.user.create({
            data: {
                id: id,
                email: email,
            },
        });
        return user;

    } catch (e) {
        if (e.code === 'P2002') {
            throw new UserAlreadyExists(id, 'User already exists in the database');
        }
        throw e;
    }
}

const create = async (email: string, password: string, inviteCode?: string): Promise<User> => {
    let role: string;
    let schoolID: string | undefined;
    if (inviteCode) {
        const invite = await prisma.schoolInvite.findFirst({
            where: {
                code: inviteCode,
            },
        });
        if (!invite) {
            throw new InvalidInvite(inviteCode);
        }
        schoolID = invite.schoolId;
        role = invite.role;

    } else {
        role = ROLES.ADMIN;
        schoolID = undefined;
    }

    if (password.length < 12) {
        throw new PasswordTooShort();
    }
    if (!isEmail(email)) {
        throw new InvalidEmail();
    }
    const id = uuidv4();
    await createIDP(id, email, password);
    const user = await createDB(id, email);
    if (schoolID) {
        await joinSchool(id, schoolID, role);
    }
    return user;
};


export const UserService = {
    create,
};