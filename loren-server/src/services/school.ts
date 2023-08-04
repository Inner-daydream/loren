import { PrismaClient, School } from '@prisma/client';
import { ROLES } from '../constants';

const prisma = new PrismaClient();
export class SchoolAlreadyExist extends Error {
    status: number
    constructor() {
        super('School already exists');
        this.status = 409;
    }
}
export class UserAlreadyHasASchool extends Error {
    constructor() {
        super('Logged user already has a school');
    }
}
export class UserDoesNotHaveASchool extends Error {
    constructor() {
        super('Logged user does not have a school');
    }
}
export class UserNotFound extends Error {
    constructor(userID: string) {
        super('User not found: ' + userID);
    }
}
async function userHasSchool(userID: string): Promise<Boolean> {
    try {
        const user = await prisma.user.findUniqueOrThrow({
            where: {
                id: userID
            }
        });
        const schoolID = user?.schoolId;
        return schoolID !== null && schoolID !== undefined
    } catch (e) {
        if (e.code !== 'P2025') {
            throw new UserNotFound(userID);
        }
        throw e;
    }


}
const create = async (userID: string, name: string, phone?: string): Promise<School> => {
    let userId: string = userID;
    const hasSchool = await userHasSchool(userId);
    if (hasSchool) {
        throw new UserAlreadyHasASchool();
    }
    const school = await prisma.school.create({
        data: {
            name: name,
            phone: phone,
        },
    });
    await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            schoolId: school.id
        }
    });
    generateInvite(school.id, ROLES.TEACHER);
    generateInvite(school.id, ROLES.STUDENT);
    return school;



};

const get = async (userID: string) => {
    try {
        const user = await prisma.user.findUniqueOrThrow({
            where: {
                id: userID
            }
        });
        if (user.schoolId == null) {
            throw new UserDoesNotHaveASchool();
        }
        return await prisma.school.findUniqueOrThrow({
            where: {
                id: user.schoolId
            }
        })
    } catch (e) {
        throw e;
    }
}

const generateInvite = async (schoolID: string, role: string, expiryDate?: Date): Promise<string> => {
    try {
        const invite = await prisma.schoolInvite.create({
            data: {
                schoolId: schoolID,
                role: role,
                expiresAt: expiryDate
            }
        });
        return invite.code;
    } catch (e) {
        console.log(e);
        throw e;
    }

}

export const SchoolService = {
    create,
    generateInvite,
    get
};