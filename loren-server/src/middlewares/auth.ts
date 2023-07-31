import { NextFunction, Response } from "express"
import { env } from "../env"
import type { AuthRequest, jsonResponse } from "../types"

export function authorizationMiddleware(allowedRoles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (req.oidc?.isAuthenticated()) {
            if (allowedRoles.includes(req.oidc?.user.role)) {
                next()
                return
            }
        }
        let response: jsonResponse = {
            error: 'Unauthorized',
            message: 'You are not authorized to access this resource',
        }
        if (env.DEBUG && req.oidc?.isAuthenticated()) {
            response.debug = {
                allowedRoles: allowedRoles,
                user: req.oidc?.user,
            }
        }
        res.status(401).json(response)
    }
}