import { Request, Response, Router } from "express";
import Controller from "../interfaces/controller_interface";
import authMiddleware, { ReqUser } from "../middleware/authentication";
import catchError from "../middleware/catch_error";
import addActivitySchema, {
    AddActivityData,
} from "../middleware/schemas/habit/add_activity_schema";
import addHabitSchema, { AddHabitData } from "../middleware/schemas/habit/add_habit_schema";
import validate from "../middleware/validate";
import { Habit, UserData } from "../models/user";
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
            `/habit/add`,
            authMiddleware,
            validate(addHabitSchema),
            catchError(this.addHabit)
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

    private addHabit = async (
        req: Request<never, never, AddHabitData["body"]> & ReqUser,
        res: Response
    ) => {
        const { name, steps } = req.body;
        const { userName } = req.user;
        const userData = userName == "kuba" ? this.kubaData : this.juliaData;

        const newHabit: Habit = {
            name,
            steps,
            activities: [],
        };

        userData.habits.push(newHabit);

        saveUserDataToJson(userName, userData);

        res.send({ message: "Udało się dodać nawyk" });
    };

    private addActivity = async (
        req: Request<never, never, AddActivityData["body"]> & ReqUser,
        res: Response
    ) => {
        const { habitName, date } = req.body;
        const { userName } = req.user;
        const userData = userName == "kuba" ? this.kubaData : this.juliaData;
        console.log(date)
        const habit = this.findHabit(userData, habitName)!;

        const { steps, activities } = habit;

        if (steps === 1) {
            this.addActivitySorted(activities, `${date}`, false);
        } else {
            this.addStepToActivity(activities, `${date}`, steps);
        }

        saveUserDataToJson(userName, userData);

        res.send({ message: "Udało się dodać aktywność", data: userData });
    };

    private addStepToActivity = (activities: [string, number?][], date: string, steps: number) => {
        const index = this.findActivityIndex(activities, `${date}`);

        if (index === -1) {
            this.addActivitySorted(activities, date, true);
        } else {
            if (activities[index][1]! == steps - 1) {
                activities[index] = [`${date}`];
            } else {
                activities[index][1]!++;
            }
        }
    };

    private deleteActivity = async (
        req: Request<never, never, AddActivityData["body"]> & ReqUser,
        res: Response
    ) => {
        const { habitName, date } = req.body;
        const { userName } = req.user;
        const userData = userName == "kuba" ? this.kubaData : this.juliaData;
        const habit = this.findHabit(userData, habitName)!;
        const { steps, activities } = habit;

        const index = this.findActivityIndex(activities, `${date}`);

        if (steps === 1) {
            activities.splice(index, 1);
        } else {
            this.deleteStepFromActivity(activities, index, steps);
        }

        saveUserDataToJson(userName, userData);

        res.send({ message: "Udało się usunąć aktywność", data: userData });
    };

    private deleteStepFromActivity = (
        activities: [string, number?][],
        index: number,
        steps: number
    ) => {
        if (activities[index][1] === undefined) {
            activities[index][1] = steps - 1;
        } else if (activities[index][1] == 1) {
            activities.splice(index, 1);
        } else {
            activities[index][1]!--;
        }
    };

    private findHabit = (userData: UserData, habitName: string): Habit => {
        return userData.habits.find((habit) => habit.name === habitName)!;
    };

    private findActivityIndex = (activities: [string, number?][], date: string): number => {
        for (let index = activities.length - 1; index >= 0; index--) {
            if (activities[index][0] === date) {
                return index;
            }
        }
        return -1;
    };

    private addActivitySorted = (activities: [string, number?][], date: string, steps: boolean) => {
        const index = this.sortedIndex(activities, new Date(date));

        if (steps) activities.splice(index, 0, [date, 1]);
        else activities.splice(index, 0, [date]);
    };

    sortedIndex = (array: any, value: Date) => {
        var low = 0,
            high = array.length;

        while (low < high) {
            var mid = (low + high) >>> 1;
            if (new Date(array[mid][0]) < value) low = mid + 1;
            else high = mid;
        }
        return low;
    };
}
export default HabitController;
