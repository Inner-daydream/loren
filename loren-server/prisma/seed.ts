import { PrismaClient } from '@prisma/client'
import { UserService } from '../src/services/user'
import { randomUUID } from 'crypto'
import { ROLES } from '../src/constants'
import { ManagementClient } from 'auth0';
import { ALL } from 'dns';
import { cp } from 'fs';
import { SchoolService } from '../src/services/school';
const management = new ManagementClient({
    domain: process.env.AUTH0_DOMAIN as string,
    token: process.env.AUTH0_TOKEN as string,
});
const prisma = new PrismaClient()
async function main() {
    const jacques = {
        email: 'jacques@loren.app',
        password: randomUUID(),
    }
    const jeanne = {
        email: 'jeanne@loren.app',
        password: randomUUID(),
    }

    const jean = {
        email: 'jean@loren.app',
        password: randomUUID(),
    }
    const school = {
        "name": "MySchool",
        "phone": "<Phone number>"
    }
    let invitRoleSTUDENT: Promise<string>;
    let invitRoleTEACHER: Promise<string>;

    const res1 = management.getUsersByEmail(jacques.email, function (err, users) {
        let createUser;
        if (users.length == 0) {
            createUser = UserService.create(jacques.email, jacques.password);
            console.log("User jacques recreated")

        } else {
            users?.map(val => {
                if (val.user_id != undefined) {
                    management.deleteUser({ id: val.user_id }, function (err) {
                        if (err) {
                            console.error("anable to delete")
                        }
                        console.log("User jacques recreated")
                        createUser = UserService.create(jacques.email, jacques.password);
                        // User deleted.
                    });
                }

            })
        }
        if (!createUser) {
            throw new Error("");
        }
        createUser.then(x => {
            const school = SchoolService.create(x.id, "school_1", "number_1");
            school.then(y => {
                invitRoleSTUDENT = SchoolService.generateInvite(y.id, ROLES.STUDENT);
                invitRoleTEACHER = SchoolService.generateInvite(y.id, ROLES.TEACHER);
            })

        })



    });
    management.getUsersByEmail(jeanne.email, function (err, users) {
        if (users.length == 0) {

            invitRoleSTUDENT.then(x => UserService.create(jeanne.email, jeanne.password, x));
            console.log("User jeanne recreated")

        } else {
            users.map(val => {
                if (val.user_id != undefined) {
                    management.deleteUser({ id: val.user_id }, function (err) {
                        if (err) {
                            console.error("anable to delete")
                        }
                        console.log("User jeanne recreated")
                        invitRoleSTUDENT.then(x => UserService.create(jeanne.email, jeanne.password, x));
                        // User deleted.
                    });
                }

            })

        }
    });
    management.getUsersByEmail(jean.email, function (err, users) {
        if (users.length == 0) {
            invitRoleTEACHER.then(x => UserService.create(jean.email, jean.password, x));

            console.log("User jean recreated")

        } else {
            users.map(val => {
                if (val.user_id != undefined) {
                    management.deleteUser({ id: val.user_id }, function (err) {
                        if (err) {
                            console.error("anable to delete")
                        }
                        console.log("User jean recreated")
                        invitRoleTEACHER.then(x => UserService.create(jean.email, jean.password, x));
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