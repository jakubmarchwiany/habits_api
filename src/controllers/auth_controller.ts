import bcrypt from "bcrypt";
import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import Controller from "../interfaces/controller_interface";
import authMiddleware, { ReqUser } from "../middleware/authentication";
import catchError from "../middleware/catch_error";
import HttpException from "../middleware/exceptions/http";
import WrongCredentialsException from "../middleware/exceptions/wrong-credentials-exception";
import loginUserSchema, { LoginUserData } from "../middleware/schemas/auth/login_user_schema";
import { CreateHabitData } from "../middleware/schemas/habit/create_habit_schema";
import validate from "../middleware/validate";
import { DataStoredInToken } from "../models/data_stored_in_token";
import User from "../models/user/user_model";
import { UserActivitiesDB, getUserActivities } from "../utils/mongoDB";

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
        this.router.get(`/get_user_habits`, authMiddleware, catchError(this.getUserData));
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

    private getUserData = async (
        req: Request<never, never, CreateHabitData["body"], { days: number; isUser: string }> &
            ReqUser,
        res: Response
    ) => {
        const { username, dearUsername } = req.user;
        const { days, isUser } = req.query;

        const user = isUser === "true" ? username : dearUsername;

        const dateAgo = new Date();
        dateAgo.setDate(dateAgo.getDate() - days);

        const userData = await this.user.findOne({ username: user }, { habits: 1 }).lean();

        if (userData) {
            const userHabitsID = userData.habits.map((habit) => habit._id);

            const userActivities = (await getUserActivities(
                dateAgo,
                userHabitsID
            )) as UserActivitiesDB[];

            userData.habits.map((habit) => {
                habit.activities = [];
            });

            for (let i = 0; i < userActivities.length; i++) {
                userData.habits.find(
                    (habit) => habit._id.toString() === userActivities[i]._id.toString()
                ).activities = userActivities[i].activities;
            }
            res.send({
                message: "Udało się pobrać nawyki użytkownika",
                data: userData,
            });
        } else {
            throw new HttpException(400, "Nie znaleziono użytkownika");
        }
    };
}
export default AuthenticationController;
