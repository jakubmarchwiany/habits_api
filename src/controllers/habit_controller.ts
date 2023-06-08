import { NextFunction, Request, Response, Router } from "express";
import Controller from "../interfaces/controller-interface";
import authMiddleware, { ReqUser } from "../middleware/authentication";
import catchError from "../middleware/catch-error";
import loginUserSchema from "../middleware/schemas/auth/login_user_schema";
import validate from "../middleware/validate";
import addHabitSchema, { AddHabitData } from "../middleware/schemas/habit/add_habit_schema";
import { Habit, UserData } from "../models/user";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

class HabitController implements Controller {
    public router = Router();
    public path = "/user";

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`/data`, authMiddleware, catchError(this.getUserData));
        this.router.post(
            `/habit/add`,
            authMiddleware,
            validate(addHabitSchema),
            catchError(this.addHabit)
        );
    }

    private readonly getUserData = async (
        req: Request<never, never, AddHabitData["body"]> & ReqUser,
        res: Response
    ) => {
        const { name: userName } = req.user;

        const userData = this.getUserDataFromJson(userName);

        res.send({ message: "Udało się pobrać dane użytkownika", data: userData });
    };

    private readonly addHabit = async (
        req: Request<never, never, AddHabitData["body"]> & ReqUser,
        res: Response,
        next: NextFunction
    ) => {
        const { name, numberOfActivitiesPerDay } = req.body;
        const { name: userName } = req.user;

        console.log(userName);
        console.log(name, numberOfActivitiesPerDay);

        const newHabit: Habit = {
            name: name,
            numberOfActivitiesPerDay: numberOfActivitiesPerDay,
            activities: [],
        };

        const userData = this.getUserDataFromJson(userName);

        userData.habits.push(newHabit);

        this.saveUserDataToJson(userName, userData);

        res.send({ message: "Udało się dodać nawyk" });
    };

    getUserDataFromJson(userName: string): UserData {
        const data = readFileSync(
            path.join(__dirname + "../../data/") + `${userName}.json`,
            "utf8"
        );
        const jsonData = JSON.parse(data) as UserData;
        return jsonData;
    }

    saveUserDataToJson(userName: string, userData: UserData) {
        userData.version++;

        const data = JSON.stringify(userData);
        writeFileSync(path.join(__dirname + "../../data/") + `${userName}.json`, data);
    }
}
export default HabitController;
