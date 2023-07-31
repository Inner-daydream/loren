import { SchoolService } from "../services/school";
import { Request, Response, NextFunction } from 'express';
import { MissingFields } from "./exceptions/MissingFildsException";

const create = async (req: Request, res: Response, next: NextFunction) => {
    const { name, phone } = req.body;
    if (!name || !phone) {
        return next(new MissingFields());
    }
    try {
        await SchoolService.create(name, phone);
        res.sendStatus(201);
    } catch (e) {
        console.log(e);
        res.status(500);
    }
}

export const SchoolController = {
    create
}