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
        where: { email: 'bob@prisma.io' },
        update: {},
        create: {
            email: 'jean@loren.app',
            role: 'teacher',
        },
    })
    console.log({ jean, jeanne })
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