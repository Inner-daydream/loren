import { PrismaClient } from "@prisma/client";
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

const create = async (email: string, password: string, joinCode?: string): Promise<void> => {
    let role: string;
    let schoolId: string | undefined;
    if (joinCode) {
        const school = await prisma.school.findFirst({
            where: {
                OR: [
                    { teacherCode: joinCode },
                    { studentCode: joinCode },
                ],
            },
        });
        if (!school) {
            throw new InvalidJoinCode();
        }
        schoolId = school.id;
        if (school.teacherCode === joinCode) {
            role = ROLES.TEACHER;
        } else {
            role = ROLES.STUDENT;
        }
    } else {
        role = ROLES.ADMIN;
        schoolId = undefined;
    }

    if (password.length < 12) {
        throw new PasswordTooShort();
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
        await prisma.user.create({
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
    if (schoolId) {
        await joinSchool(id, schoolId, role);
    }
};

export const UserService = {
    create,
};