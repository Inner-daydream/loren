import { PrismaClient, School } from '@prisma/client';
import { ROLES } from '../constants';
import { UserNotFound } from './user';
const prisma = new PrismaClient();
export class SchoolAlreadyExist extends Error {
    constructor(schoolID: string, message?: string) {
        message = message || 'School already exists';
        super(message + ': ' + schoolID);
    }
}
export class UserAlreadyHasASchool extends Error {
    constructor(schoolID: string, message?: string) {
        message = message || 'User already has a school';
        super(message + ': ' + schoolID);
    }
}
export class UserDoesNotHaveASchool extends Error {
    constructor() {
        super('Logged user does not have a school');
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
        throw new UserAlreadyHasASchool(userId);
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

}


const generateInvite = async (schoolID: string, role: string, expiryDate?: Date): Promise<string> => {
    const invite = await prisma.schoolInvite.create({
        data: {
            schoolId: schoolID,
            role: role,
            expiresAt: expiryDate
        }
    });
    return invite.code;
}

export const SchoolService = {
    create,
    generateInvite,
    get
};