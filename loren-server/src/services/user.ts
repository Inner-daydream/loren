import { PrismaClient, User } from "@prisma/client";
import { ManagementClient } from 'auth0';
import isEmail from 'validator/lib/isEmail';
import { v4 as uuidv4 } from 'uuid';
import { env } from "../env";
import { ROLES } from '../constants';
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
    constructor() {
        super('User already exists');
    }
}
export class InvalidJoinCode extends Error {
    constructor() {
        super('Invalid join code');
    }
}

const joinSchool = async (userId: string, schoolId: string, role: string): Promise<void> => {
    try {
        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                schoolId: schoolId,
                role: role,
            },
        });
    } catch (e) {
        console.log(e);
        throw e;
    }
};

const create = async (email: string, password: string, joinCode?: string): Promise<User> => {
    let role: string;
    let schoolId: string | undefined;
    if (joinCode) {
        const invite = await prisma.schoolInvite.findFirst({
            where: {
                code: joinCode,
            },
        });
        if (!invite) {
            throw new InvalidJoinCode();
        }
        schoolId = invite.schoolId;
        role = invite.role;

    } else {
        role = ROLES.ADMIN;
        schoolId = undefined;
    }

    if (password.length < 12) {
        //throw new PasswordTooShort();
    }
    if (!isEmail(email)) {
        throw new InvalidEmail();
    }
    await prisma.user.findFirst({
        where: {
            email: email,
        },
    }).then((user) => {
        if (user) {
            console.log("user already exists")
            throw new UserAlreadyExists();
        }
    });
    const id = uuidv4();
    try {
        await management.createUser({
            connection: env.AUTH0_CONNECTION,
            email: email,
            password: password,
            user_id: id,
            app_metadata: {
                role: ROLES.ADMIN,
            },
        });

    } catch (e) {
        console.log(e);
        if (e.statusCode === 409) {
            throw new UserAlreadyExists();
        }
        throw e;
    }
    try {
        return await prisma.user.create({
            data: {
                id: id,
                email: email,
                role: ROLES.ADMIN,
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