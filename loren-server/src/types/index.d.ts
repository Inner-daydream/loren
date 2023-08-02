import { Request } from 'express';
import { User } from 'oidc-client';

interface AuthRequest extends Request {
    oidc?: {
        isAuthenticated(): boolean;
        user?: User;
    };
}