import { NextFunction, Request, Response, Router } from "express";
import Controller from "../interfaces/controller-interface";
import catchError from "../middleware/catch-error";
import loginUserSchema, { LoginUserData } from "../middleware/schemas/auth/login-user-schema";
import validate from "../middleware/validate";
import authMiddleware from "../middleware/authentication";

class HabitController implements Controller {
    public router = Router();
    public path = "/habit";

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
            `/add`,
            authMiddleware,
            validate(loginUserSchema),
            catchError(this.addHabit)
        );
    }

    private readonly addHabit = async (
        req: Request<never, never, LoginUserData["body"]>,
        res: Response,
        next: NextFunction
    ) => {
        const { username, password } = req.body;
        res.send("działam");
    };
}
export default HabitController;
