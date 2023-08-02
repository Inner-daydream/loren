import { SchoolService } from "../services/school";
import { Request, Response, NextFunction } from 'express';
import { MissingFields } from "../exceptions";

const create = async (req: Request, res: Response, next: NextFunction) => {
    const { name, phone } = req.body;
    const userID = (req.oidc?.user?.sub as string).substring(6);
    if (!name || !phone) {
        return next(new MissingFields());
    }
    try {
        await SchoolService.create(userID, name, phone);
        res.sendStatus(201);
    } catch (e) {
        next(e);
        res.status(500);
    }
}

export const SchoolController = {
    create
}