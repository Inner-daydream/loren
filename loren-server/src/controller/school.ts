import { SchoolService } from "../services/school";
import { MissingFilds } from "./Exceptions/MissingFildsException";


const create = async (req: any, res: any, next: any) => {
    const { name, phone } = req.body;

    if (!name || !phone) {
        return next(new MissingFilds());
    }
    try {
        const test = await SchoolService.create(req.oidc.user.sub, name, phone);
        return res.send(test)
    } catch (e) {
        next(e)
    }
}
export const SchoolController = {
    create,
}