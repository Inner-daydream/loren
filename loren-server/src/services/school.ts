import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const create = async (name: string, phone?: string) => {
    const school = await prisma.school.create({
        data: {
            name: name,
            phone: phone,
        },
    });
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

const stripeSubscription = {

}

export const SchoolService = {
    create,
};