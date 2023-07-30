import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    const jeanne = await prisma.user.upsert({
        where: { email: 'jeanne@loren.app' },
        update: {},
        create: {
            email: 'jeanne@loren.app',
            role: 'student',
        },
    })
    const jean = await prisma.user.upsert({
        where: { email: 'jean@loren.app' },
        update: {},
        create: {
            email: 'jean@loren.app',
            role: 'teacher',
        },
    })
    const school = await prisma.school.upsert({
        where: { name: 'Loren' },
        update: {},
        create: {
            name: 'Loren',
            users: {
                connect: [
                    { id: jeanne.id },
                    { id: jean.id },
                ],
            },
        },
    })
    console.log({ jean, jeanne, school })
}
main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })