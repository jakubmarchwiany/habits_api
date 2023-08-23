import bcrypt from "bcrypt";
import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import Controller from "../interfaces/controller_interface";
import catchError from "../middleware/catch_error";
import WrongCredentialsException from "../middleware/exceptions/wrong-credentials-exception";
import loginUserSchema, { LoginUserData } from "../middleware/schemas/auth/login_user_schema";
import validate from "../middleware/validate";
import { DataStoredInToken } from "../models/data_stored_in_token";
import User from "../models/user/user_model";

const { JWT_SECRET, TOKEN_EXPIRE_AFTER } = process.env;

class AuthenticationController implements Controller {
    public router = Router();
    public path = "/auth";
    private user = User;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`/login`, validate(loginUserSchema), catchError(this.loggingIn));
    }

    private loggingIn = async (
        req: Request<never, never, LoginUserData["body"]>,
        res: Response
    ) => {
        const { username, password } = req.body;

        const user = await this.user.findOne({ username }, { username: 1, password: 1 }).lean();

        if (user !== null) {
            const isPasswordMatching = await bcrypt.compare(password, user.password);

            if (isPasswordMatching) {
                const dearUsername = username === "kuba" ? "julia" : "kuba";
                const dataStoredInToken: DataStoredInToken = {
                    username,
                    dearUsername,
                };

                const expiresIn = parseInt(TOKEN_EXPIRE_AFTER);
                const tokenData = jwt.sign(dataStoredInToken, JWT_SECRET!, { expiresIn });

                res.send({
                    token: tokenData,
                    message: "Udało się zalogować",
                });
            } else {
                throw new WrongCredentialsException();
            }
        } else {
            throw new WrongCredentialsException();
        }
    };
}
export default AuthenticationController;
