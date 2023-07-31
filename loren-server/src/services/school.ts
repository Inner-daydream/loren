import { PrismaClient, User } from '@prisma/client';

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
async function userHasSchool(user_id: string) {
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id: user_id
        }
    });
    console.log(user.schoolId != null);
    return user.schoolId != null;
}
const create = async (user_id: string, name: string, phone?: string) => {
    try {
        let userId: string = user_id.substring(6);
        const hasSchool = await !userHasSchool(userId);
        console.log(!hasSchool)
        if (!hasSchool) {
            console.log("adding school...");

            const school = await prisma.school.create({
                data: {
                    name: name,
                    phone: phone,
                },
            });
            const user = await prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    schoolId: school.id
                }
            });

            console.log(school)
            return school;
        } else {
            throw new UserAlreadyHasASchool();
        }

    } catch (e) {
        if (e.statusCode === 409) {
            throw new SchoolAlreadyExist();
        }
        throw e;
    }

};

const addSubscription = async (schoolId: string, startDate: Date, endDate: Date) => {

    const subscription = await prisma.subscription.create({
        data: {
            schoolId: schoolId,
            startDate: startDate,
            endDate: endDate,
        },
    });

};


export const SchoolService = {
    create,
};