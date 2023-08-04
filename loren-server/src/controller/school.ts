import { SchoolService } from "../services/school";
import { Request, Response, NextFunction } from 'express';
import zod from "zod";

const CreateSchema = zod.object({
    name: zod.string(),
    phone: zod.optional(zod.string()),
});
const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        CreateSchema.parse(req.body);
    } catch (e) {
        return next(e);
    }
    const { name, phone } = req.body;
    const userID = (req.oidc?.user?.sub as string).substring(6);
    try {
        await SchoolService.create(userID, name, phone);
        res.status(201).json({
            message: 'School created successfully',
        });
    } catch (e) {
        return next(e);
    }
}

export const SchoolController = {
    create
}