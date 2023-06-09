import { Request, Response, Router } from "express";
import uniqid from "uniqid";
import Controller from "../interfaces/controller_interface";
import authMiddleware, { ReqUser } from "../middleware/authentication";
import catchError from "../middleware/catch_error";
import addActivitySchema, {
    AddActivityData,
} from "../middleware/schemas/habit/add_activity_schema";
import addHabitSchema, { AddHabitData } from "../middleware/schemas/habit/add_habit_schema";
import validate from "../middleware/validate";
import { Habit } from "../models/habit";
import { UserData } from "../models/user_data";
import { getUserDataFromJson, saveUserDataToJson } from "../utils/json_manager";

class HabitController implements Controller {
    public router = Router();
    public path = "/user";
    public kubaData = getUserDataFromJson("kuba");
    public juliaData = getUserDataFromJson("kuba");

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`/data`, authMiddleware, catchError(this.getUserData));
        this.router.post(
            `/habit/create`,
            authMiddleware,
            validate(addHabitSchema),
            catchError(this.createHabit)
        );
        this.router.post(
            "/habit/activity/add",
            authMiddleware,
            validate(addActivitySchema),
            catchError(this.addActivity)
        );
        this.router.post(
            "/habit/activity/delete",
            authMiddleware,
            validate(addActivitySchema),
            catchError(this.deleteActivity)
        );
    }

    private getUserData = async (
        req: Request<never, never, AddHabitData["body"]> & ReqUser,
        res: Response
    ) => {
        const { userName } = req.user;
        const userData = userName == "kuba" ? this.kubaData : this.juliaData;
        const data = structuredClone(userData) as UserData;

        data.habits.forEach((habit) => {
            return habit.activities.length > 60 && habit.activities.splice(-30);
        });

        res.send({ message: "Udało się pobrać dane użytkownika", data });
    };

    private createHabit = async (
        req: Request<never, never, AddHabitData["body"]> & ReqUser,
        res: Response
    ) => {
        const { name } = req.body;
        const { userName } = req.user;
        const userData = userName == "kuba" ? this.kubaData : this.juliaData;

        const newHabit: Habit = {
            id: uniqid(),
            name,
            activities: [],
        };

        userData.habits.push(newHabit);

        saveUserDataToJson(userName, userData);

        res.send({ message: "Udało się stworzyć nawyk", data: newHabit });
    };

    private addActivity = async (
        req: Request<never, never, AddActivityData["body"]> & ReqUser,
        res: Response
    ) => {
        const { id, date } = req.body;
        const { userName } = req.user;
        const userData = userName == "kuba" ? this.kubaData : this.juliaData;

        const habit = this.findHabitByID(id, userData.habits)!;
        const index = this.findRightIndexByDate(date, habit.activities);

        habit.activities.splice(index, 0, date);

        saveUserDataToJson(userName, userData);
        res.send({ message: "Udało się dodać aktywność" });
    };

    private deleteActivity = async (
        req: Request<never, never, AddActivityData["body"]> & ReqUser,
        res: Response
    ) => {
        const { id, date } = req.body;
        const { userName } = req.user;
        const userData = userName == "kuba" ? this.kubaData : this.juliaData;
        const habit = this.findHabitByID(id, userData.habits);

        const index = this.findRightIndexByDate(date, habit.activities);
        console.log(index);
        habit.activities.splice(index, 1);

        saveUserDataToJson(userName, userData);
        res.send({ message: "Udało się usunąć aktywność" });
    };
    private findHabitByID = (id: string, habits: UserData["habits"]): Habit => {
        return habits.find((habit) => habit.id === id)!;
    };

    findRightIndexByDate = (newDateString: string, activities: string[]) => {
        let newDate = new Date(newDateString);
        let low = 0,
            high = activities.length;

        while (low < high) {
            let mid = (low + high) >>> 1;
            if (new Date(activities[mid]) < newDate) low = mid + 1;
            else high = mid;
        }
        return low;
    };
}
export default HabitController;
