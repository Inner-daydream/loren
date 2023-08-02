import { PrismaClient, User } from '@prisma/client'
import { UserService } from '../src/services/user'
import { randomUUID } from 'crypto'
import { ROLES } from '../src/constants'
import { ManagementClient } from 'auth0';
import { SchoolService } from '../src/services/school';
import { env } from '../src/env';
import { cp } from 'fs';
const management = new ManagementClient({
    domain: env.AUTH0_DOMAIN,
    token: env.AUTH0_TOKEN,
});
const prisma = new PrismaClient()



type SeedUserData = {
    email: string
    password: string
}

const adminData: SeedUserData = {
    email: 'jacques@loren.app',
    password: randomUUID(),
}
const teacherData: SeedUserData = {
    email: 'jeanne@loren.app',
    password: randomUUID(),
}

const studentData: SeedUserData = {
    email: 'jean@loren.app',
    password: randomUUID(),
}
const schoolData = {
    "name": "MySchool",
    "phone": "0606060606",
}

const ensureUserExists = async (userData: SeedUserData, joinCode?: string): Promise<User> => {
    const auth0User = await management.getUsersByEmail(userData.email)
    let user: User | null = null
    if (auth0User.length === 0) {
        user = await UserService.create(userData.email, userData.password, joinCode)
    } else {
        if (auth0User[0].user_id) {
            await management.deleteUser({ id: auth0User[0].user_id })
            user = await UserService.create(userData.email, userData.password)
        }
    }
    if (!user) {
        throw new Error('User not created')
    }
    return user
}
async function main() {
    const admin = await ensureUserExists(adminData)
    const school = await SchoolService.create(admin.id, schoolData.name, schoolData.phone)
    const teacherInvite = await SchoolService.generateInvite(school.id, ROLES.TEACHER)
    const studentInvite = await SchoolService.generateInvite(school.id, ROLES.STUDENT)
    await ensureUserExists(teacherData, teacherInvite)
    await ensureUserExists(studentData, studentInvite)
    console.log('Seeding complete')
    console.log('User credentials:')
    console.log(adminData, teacherData, studentData)
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

