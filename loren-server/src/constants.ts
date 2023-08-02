export const ROLES = {
    ADMIN: "ADMIN",
    TEACHER: "TEACHER",
    STUDENT: "STUDENT"
} as const;

export enum SIGNAL {
    SIGINT = 'SIGINT',
    SIGTERM = 'SIGTERM',
}