import { Request, Response, Router } from "express";
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
import deleteActivitySchema, {
    DeleteActivityData,
} from "../middleware/schemas/habit/delete_activity_schema";
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
import Activity from "../models/activity/activity_model";
import { IHabit } from "../models/user/habit_interface";
import User from "../models/user/user_model";
import mongoose, { ObjectId } from "mongoose";
import { IActivity } from "../models/activity/activity_interface";
import { UserActivitiesDB, getUserActivities } from "../utils/mongoDB";

class HabitController implements Controller {
    public router = Router();
    public path = "/user";
    private readonly user = User;
    private readonly activity = Activity;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`/get_habits`, authMiddleware, catchError(this.getHabits));
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
            catchError(this.createActivity)
        );
        this.router.post(
            "/habit/activity/delete",
            authMiddleware,
            validate(deleteActivitySchema),
            catchError(this.deleteActivity)
        );
    }
    private getHabits = async (
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
            console.log(userData);

            const data = { habits: userData.habits, HabitsGroups: [] };
            res.send({
                message: "Udało się pobrać nawyki użytkownika",
                data,
            });
        } else {
            throw new HttpException(400, "Nie znaleziono użytkownika");
        }
    };

    private createHabit = async (
        req: Request<never, never, CreateHabitData["body"]> & ReqUser,
        res: Response
    ) => {
        const { name, description, periodInDays } = req.body;
        const { username } = req.user;

        const newHabitID = new mongoose.mongo.ObjectId();
        const habit: IHabit = {
            _id: newHabitID.toString(),
            name,
            description,
            periodInDays,
        };

        const createHabitDB = await this.user.updateOne({ username }, { $push: { habits: habit } });

        if (createHabitDB.modifiedCount === 0)
            throw new HttpException(400, "Nie udało się dodać nawyku");

        res.send({ message: "Udało się dodać nawyk", data: habit });
    };

    private editHabitName = async (
        req: Request<never, never, EditHabitNameData["body"]> & ReqUser,
        res: Response
    ) => {
        const { id, newName } = req.body;
        const { username } = req.user;

        const editHabitDB = await this.user.updateOne(
            { username, "habits._id": id },
            { $set: { "habits.$.name": newName } }
        );

        if (editHabitDB.modifiedCount === 0)
            throw new HttpException(400, "Nie udało się zmienić nazwy nawyku");

        res.send({ message: "Udało się zmienić nazwę nawyku" });
    };

    private editHabitsOrder = async (
        req: Request<never, never, EditOrderHabitsData["body"]> & ReqUser,
        res: Response
    ) => {
        const { habitsID } = req.body;
        const { username } = req.user;

        const userHabits = await this.user.findOne({ username }, { habits: 1 }).lean();

        const newHabitsOrder = [];

        for (const id of habitsID) {
            const habit = userHabits.habits.find((habit) => habit._id == id);
            if (habit) {
                newHabitsOrder.push(habit);
            }
        }

        const newOrderDB = await this.user.updateOne(
            { username },
            { $set: { habits: newHabitsOrder } }
        );

        if (newOrderDB.modifiedCount === 0)
            throw new HttpException(400, "Nie udało się zmienić kolejność nawyków");

        res.send({ message: "Udało się zmienić kolejność nawyków" });
    };

    private deleteHabit = async (
        req: Request<never, never, DeleteHabitData["body"]> & ReqUser,
        res: Response
    ) => {
        const { id } = req.body;
        const { username } = req.user;

        const session = await mongoose.startSession();

        try {
            session.startTransaction();

            const deleteHabitFromUserDB = await this.user.updateOne(
                { username, "habits._id": id },
                { $pull: { habits: { _id: id } } },
                { session }
            );

            if (deleteHabitFromUserDB.modifiedCount === 0) {
                throw new Error();
            }

            await this.activity.deleteMany({ habit: id }, { session });

            await session.commitTransaction();
            res.send({ message: "Udało się usunąć nawyk" });
        } catch (error) {
            await session.abortTransaction();
            throw new HttpException(400, "Nie udało się usunąć nawyku");
        } finally {
            session.endSession();
        }
    };

    private createActivity = async (
        req: Request<never, never, AddActivityData["body"]> & ReqUser,
        res: Response
    ) => {
        const { habitID, date } = req.body;

        const createActivityDB = await this.activity.create({ habit: habitID, date: date });

        res.send({
            message: "Udało się dodać aktywność",
            data: { activityID: createActivityDB._id },
        });
    };

    private deleteActivity = async (
        req: Request<never, never, DeleteActivityData["body"]> & ReqUser,
        res: Response
    ) => {
        const { id } = req.body;

        const dbResponse = await this.activity.deleteOne({ _id: id });

        if (dbResponse.deletedCount === 0)
            throw new HttpException(400, "Nie udało się usunąć aktywności");

        res.send({ message: "Udało się usunąć aktywność" });
    };
}
export default HabitController;
