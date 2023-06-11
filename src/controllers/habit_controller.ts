import { Request, Response, Router } from "express";
import uniqid from "uniqid";
import Controller from "../interfaces/controller_interface";
import authMiddleware, { ReqUser } from "../middleware/authentication";
import catchError from "../middleware/catch_error";
import addActivitySchema, {
    AddActivityData,
} from "../middleware/schemas/habit/add_activity_schema";
import createHabitSchema, {
    CreateHabitData,
} from "../middleware/schemas/habit/create_habit_schema";
import deleteHabitSchema, {
    DeleteHabitData,
} from "../middleware/schemas/habit/delete_habit_schema";
import editHabitNameSchema, {
    EditHabitNameData,
} from "../middleware/schemas/habit/edit_habit_name_schema";
import editHabitsOrderSchema, {
    EditOrderHabitsData,
} from "../middleware/schemas/habit/edit_habits_order_schema";
import validate from "../middleware/validate";
import { Habit } from "../models/habit";
import { UserData } from "../models/user_data";
import { getUserDataFromJson, saveUserDataToJson } from "../utils/json_manager";

class HabitController implements Controller {
    public router = Router();
    public path = "/user";
    public kubaData = getUserDataFromJson("kuba");
    public juliaData = getUserDataFromJson("julia");

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`/data`, authMiddleware, catchError(this.getUserData));
        this.router.post(
            `/habit/create`,
            authMiddleware,
            validate(createHabitSchema),
            catchError(this.createHabit)
        );
        this.router.post(
            "/habit/edit_name",
            authMiddleware,
            validate(editHabitNameSchema),
            catchError(this.editHabitName)
        );
        this.router.post(
            "/habit/edit_order",
            authMiddleware,
            validate(editHabitsOrderSchema),
            catchError(this.editHabitsOrder)
        );
        this.router.post(
            "/habit/delete",
            authMiddleware,
            validate(deleteHabitSchema),
            catchError(this.deleteHabit)
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
        req: Request<never, never, CreateHabitData["body"]> & ReqUser,
        res: Response
    ) => {
        const { userName } = req.user;

        const juliaData = JSON.parse(JSON.stringify(this.juliaData)) as UserData;
        const kubaData = JSON.parse(JSON.stringify(this.kubaData)) as UserData;

        juliaData.habits.forEach((habit) => {
            return habit.activities.length > 60 && habit.activities.splice(-60);
        });
        kubaData.habits.forEach((habit) => {
            return habit.activities.length > 60 && habit.activities.splice(-60);
        });

        const data = [];

        if (userName === "kuba") {
            data.push(kubaData);
            data.push(juliaData);
        } else {
            data.push(juliaData);
            data.push(kubaData);
        }

        res.send({ message: "Udało się pobrać dane użytkownika", data });
    };

    private createHabit = async (
        req: Request<never, never, CreateHabitData["body"]> & ReqUser,
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

    private editHabitName = async (
        req: Request<never, never, EditHabitNameData["body"]> & ReqUser,
        res: Response
    ) => {
        const { id, newName } = req.body;
        const { userName } = req.user;
        const userData = userName === "kuba" ? this.kubaData : this.juliaData;

        const habit = this.findHabitByID(id, userData.habits);

        habit.name = newName;
        saveUserDataToJson(userName, userData);
        res.send({ message: "Udało się zmienić nazwę nawyku" });
    };

    private editHabitsOrder = async (
        req: Request<never, never, EditOrderHabitsData["body"]> & ReqUser,
        res: Response
    ) => {
        const { habitsID } = req.body;
        const { userName } = req.user;
        const userData = userName === "kuba" ? this.kubaData : this.juliaData;

        const sortedHabits = [];
        for (const habitId of habitsID) {
            const habit = userData.habits.find((h) => h.id === habitId);
            if (habit) {
                sortedHabits.push(habit);
            }
        }
        if (sortedHabits.length !== userData.habits.length) {
            return res.status(400).send({ message: "Niepoprawne ID nawyku" });
        }

        userData.habits = sortedHabits;

        saveUserDataToJson(userName, userData);
        res.send({ message: "Udało się zmienić kolejność nawyków" });
    };

    private deleteHabit = async (
        req: Request<never, never, DeleteHabitData["body"]> & ReqUser,
        res: Response
    ) => {
        const { id } = req.body;
        const { userName } = req.user;
        const userData = userName === "kuba" ? this.kubaData : this.juliaData;

        const habitIndex = userData.habits.findIndex((habit) => habit.id === id);

        userData.habits.splice(habitIndex, 1);
        saveUserDataToJson(userName, userData);

        res.send({ message: "Udało się usunąć nawyk" });
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
