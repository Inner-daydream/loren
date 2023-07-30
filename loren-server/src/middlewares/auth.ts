

export function authorizationMiddleware(allowedRoles: string[]) {
    return (req: any, res: any, next: any) => {
        if (req.oidc.user != undefined) {
            if (allowedRoles.includes(req.oidc.user.role)) {
                next()
            }
        }
        req.user = req.oidc.user
        res.status(401).send()

    }
}