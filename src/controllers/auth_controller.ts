import { NextFunction, Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import Controller from "../interfaces/controller_interface";
import catchError from "../middleware/catch_error";
import WrongCredentialsException from "../middleware/exceptions/wrong-credentials-exception";
import loginUserSchema, { LoginUserData } from "../middleware/schemas/auth/login_user_schema";
import validate from "../middleware/validate";
import { DataStoredInToken } from "../models/data_stored_in_token";
import { getUsersFromJson } from "../utils/json_manager";

const { JWT_SECRET, TOKEN_EXPIRE_AFTER } = process.env;

class AuthenticationController implements Controller {
    public router = Router();
    public path = "/auth";
    private users = getUsersFromJson();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`/login`, validate(loginUserSchema), catchError(this.loggingIn));
    }

    private loggingIn = async (
        req: Request<never, never, LoginUserData["body"]>,
        res: Response,
        next: NextFunction
    ) => {
        const { username, password } = req.body;

        for (const element of this.users) {
            if (element.username == username) {
                if (element.password == password) {
                    const expiresIn = parseInt(TOKEN_EXPIRE_AFTER!);

                    const dataStoredInToken: DataStoredInToken = {
                        userName: username,
                    };

                    const tokenData = jwt.sign(dataStoredInToken, JWT_SECRET!, { expiresIn });

                    res.send({
                        token: tokenData,
                        message: "Udało się zalogować",
                    });
                    return;
                } else {
                    throw new WrongCredentialsException();
                }
            }
        }
        throw new WrongCredentialsException();
    };
}
export default AuthenticationController;
