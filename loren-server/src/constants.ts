export const ROLES = {
    ADMIN: "ADMIN",
    TEACHER: "TEACHER",
    STUDENT: "STUDENT",
    NONE: "NONE"
} as const;

export enum SIGNAL {
    SIGINT = 'SIGINT',
    SIGTERM = 'SIGTERM',
}