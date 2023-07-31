import { PrismaClient, School, User } from '@prisma/client';

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

    console.log(school)
    return school;



};

export const SchoolService = {
    create,
};