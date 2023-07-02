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
import authMiddleware, { ReqUser } from "../middleware/authentication";
import HttpException from "../middleware/exceptions/http";
import { CreateHabitData } from "../middleware/schemas/habit/create_habit_schema";
import { getUserActivities, UserActivitiesDB } from "../utils/mongoDB";

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
        this.router.get(`/get_user_data`, authMiddleware, catchError(this.getUserData));
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
                const dataStoredInToken: DataStoredInToken = {
                    id: user._id,
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
        req: Request<never, never, CreateHabitData["body"]> & ReqUser,
        res: Response
    ) => {
        const { id } = req.user;
        const users = await this.user.find({}, { habits: 1 }).lean();

        const dateAgo = new Date();
        dateAgo.setDate(dateAgo.getDate() - 41);

        if (users) {
            let logUser, otherUser;

            if (users[0]._id == id) {
                logUser = users[0];
                otherUser = users[1];
            } else {
                console.log("else");
                logUser = users[1];
                otherUser = users[0];
            }

            const logUserHabitsID = logUser.habits.map((habit) => habit._id);
            const otherUserHabitsID = otherUser.habits.map((habit) => habit._id);

            const logUserActivities = await getUserActivities(dateAgo, logUserHabitsID) as UserActivitiesDB[];
            const otherUserActivities = await getUserActivities(dateAgo, otherUserHabitsID) as UserActivitiesDB[];


            Promise.all([logUserActivities, otherUserActivities]).then((values) => {
                console.log(values);

                logUser.habits.map((habit) => {
                    habit.activities = [];
                });
                otherUser.habits.map((habit) => {
                    habit.activities = [];
                });

                for (let i = 0; i < values[0].length; i++) {
                    logUser.habits.find(
                        (habit) => habit._id.toString() === values[0][i]._id.toString()
                    ).activities = values[0][i].activities;
                }

                for (let j = 0; j < values[1].length; j++) {
                    otherUser.habits.find(
                        (habit) => habit._id.toString() === values[1][j]._id.toString()
                    ).activities = values[1][j].activities;
                }
                res.send({
                    message: "Udało się pobrać dane użytkownika",
                    data: [logUser, otherUser],
                });
            });
        } else {
            throw new HttpException(400, "Nie znaleziono użytkownika");
        }
    };
}
export default AuthenticationController;
