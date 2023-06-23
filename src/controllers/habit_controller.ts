import { Request, Response, Router } from "express";
import { ClientSession } from "mongoose";
import Controller from "../interfaces/controller_interface";
import authMiddleware, { ReqUser } from "../middleware/authentication";
import catchError from "../middleware/catch_error";
import HttpException from "../middleware/exceptions/http";
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
import { IHabit } from "../models/user/user_interface";
import User from "../models/user/user_model";
import { UserData } from "../models/user_data";
import { getUserDataFromJson, saveUserDataToJson } from "../utils/json_manager";

const { WHITELISTED_DOMAINS, MONGO_URL } = process.env;

class HabitController implements Controller {
    public router = Router();
    public path = "/user";
    private readonly user = User;
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
        const { id } = req.user;
        const user = await this.user.findById(id);

        if (user) {
            res.send({ message: "Udało się pobrać dane użytkownika", data: user });
        } else {
            throw new HttpException(400, "Nie znaleziono użytkownika");
        }
    };

    private createHabit = async (
        req: Request<never, never, CreateHabitData["body"]> & ReqUser,
        res: Response
    ) => {
        const { name, n_steps } = req.body;
        const { id } = req.user;

        const habit: IHabit = { name: name, n_steps: n_steps };

        await this.user.findByIdAndUpdate(id, { $push: { habits: habit } });

        res.send({ message: "Udało się dodać nawyk" });
    };

    private editHabitName = async (
        req: Request<never, never, EditHabitNameData["body"]> & ReqUser,
        res: Response
    ) => {
        const { id, newName } = req.body;
        const { id: userID } = req.user;

        await this.user.updateOne(
            { _id: userID, "habits._id": id },
            { $set: { "habits.$.name": newName } }
        );

        res.send({ message: "Udało się zmienić nazwę nawyku" });
    };

    private editHabitsOrder = async (
        req: Request<never, never, EditOrderHabitsData["body"]> & ReqUser,
        res: Response
    ) => {
        const { habitsID } = req.body;
        const { id } = req.user;

        const userHabits = await this.user.findById(id, { habits: 1 }).lean();

        const newOrder = [];

        for (const id of habitsID) {
            const habit = userHabits.habits.find((habit) => habit._id == id);
            if (habit) {
                newOrder.push(habit);
            }
        }

        await this.user.findByIdAndUpdate(id, { $set: { habits: habitsID } });

        res.send({ message: "Udało się zmienić kolejność nawyków" });
    };

    private deleteHabit = async (
        req: Request<never, never, DeleteHabitData["body"]> & ReqUser,
        res: Response
    ) => {
        const { id } = req.body;
        const { id: userID } = req.user;

        const session: ClientSession = await this.user.startSession();
        session.startTransaction();
        try {
            await this.habit.findByIdAndDelete(id);
            await this.user.findByIdAndUpdate(userID, { $pull: { habits: id } });

            res.send({ message: "Udało się usunąć nawyk" });
            await session.commitTransaction();
        } catch (error) {
            // Rollback any changes made in the database
            await session.abortTransaction();

            // Rethrow the error
            throw new HttpException(400, "Nie udało się usunąć nawyku");
        } finally {
            session.endSession();
        }
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
