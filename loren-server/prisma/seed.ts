import { PrismaClient } from '@prisma/client'
import { UserService } from '../src/services/user'
import { randomUUID } from 'crypto'
import { ROLES } from '../src/services/constants'
import { ManagementClient } from 'auth0';
import { ALL } from 'dns';
import { cp } from 'fs';
const management = new ManagementClient({
    domain: process.env.AUTH0_DOMAIN as string,
    token: process.env.AUTH0_TOKEN as string,
});
const prisma = new PrismaClient()
async function main() {
    const jacques = {
        email: 'jacques@loren.app',
        password: randomUUID(),
        role: ROLES.ADMIN,
    }
    const jeanne = {
        email: 'jeanne@loren.app',
        password: randomUUID(),
        role: ROLES.STUDENT,
    }

    const jean = {
        email: 'jean@loren.app',
        password: randomUUID(),
        role: ROLES.TEACHER,
    }
    const res1 = management.getUsersByEmail(jacques.email, function (err, users) {
        if (users.length == 0) {
            UserService.create(jacques.email, jacques.password, jacques.role);
            console.log("User jacques recreated")

        } else {
            users.map(val => {
                if (val.user_id != undefined) {
                    management.deleteUser({ id: val.user_id }, function (err) {
                        if (err) {
                            console.error("anable to delete")
                        }
                        console.log("User jacques recreated")
                        UserService.create(jacques.email, jacques.password, jacques.role);
                        // User deleted.
                    });
                }

            })

        }


    });
    management.getUsersByEmail(jeanne.email, function (err, users) {
        if (users.length == 0) {
            UserService.create(jeanne.email, jeanne.password, jeanne.role);
            console.log("User jeanne recreated")

        } else {
            users.map(val => {
                if (val.user_id != undefined) {
                    management.deleteUser({ id: val.user_id }, function (err) {
                        if (err) {
                            console.error("anable to delete")
                        }
                        console.log("User jeanne recreated")
                        UserService.create(jeanne.email, jeanne.password, jeanne.role);
                        // User deleted.
                    });
                }

            })

        }
    });
    management.getUsersByEmail(jean.email, function (err, users) {
        if (users.length == 0) {
            UserService.create(jean.email, jean.password, jean.role);
            console.log("User jean recreated")

        } else {
            users.map(val => {
                if (val.user_id != undefined) {
                    management.deleteUser({ id: val.user_id }, function (err) {
                        if (err) {
                            console.error("anable to delete")
                        }
                        console.log("User jean recreated")
                        UserService.create(jean.email, jean.password, jean.role);
                        // User deleted.
                    });
                }

            })

        }
    });

    console.log({ jean, jeanne, jacques })
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