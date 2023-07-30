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



export const SchoolService = {
    create,
};