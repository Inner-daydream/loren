import { NextFunction, Response } from "express"
import { env } from "../env"
import type { AuthRequest } from "../types"
import type { jsonResponse } from "../responses"

export function authorizationMiddleware(allowedRoles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (req.oidc?.isAuthenticated()) {
            if (allowedRoles.includes(req.oidc?.user.role)) {
                next()
                return
            }
        }
        res.status(401).json({
            error: 'Unauthorized',
            message: 'You are not authorized to access this resource',
        })
    }
}