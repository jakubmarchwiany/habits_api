import { Request, Response, Router } from "express";
import mongoose from "mongoose";
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
import editHabitSchema, { EditHabitData } from "../middleware/schemas/habit/edit_habit_schema";
import editHabitsOrderSchema, {
    EditOrderHabitsData,
} from "../middleware/schemas/habit/edit_habits_order_schema";
import validate from "../middleware/validate";
import Activity from "../models/activity/activity_model";
import { IHabit } from "../models/user/habit_interface";
import User from "../models/user/user_model";
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
        this.router.get(`/habit/:_id`, authMiddleware, catchError(this.getHabit));
        this.router.post(
            `/habit/create`,
            authMiddleware,
            validate(createHabitSchema),
            catchError(this.createHabit)
        );
        this.router.post(
            "/habit/edit",
            authMiddleware,
            validate(editHabitSchema),
            catchError(this.editHabit)
        );
        this.router.post(
            "/habit/create_groups",
            authMiddleware,
            validate(editHabitsOrderSchema),
            catchError(this.createGroups)
        );
        this.router.post(
            "/habit/delete",
            authMiddleware,
            validate(deleteHabitSchema),
            catchError(this.deleteHabit)
        );
        this.router.post(
            "/habit/activity/create",
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

        const userData = await this.user
            .findOne({ username: user }, { habits: 1, habitGroups: 1 })
            .lean();

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

            const data = { habits: userData.habits, habitGroups: userData.habitGroups };
            console.log(data);
            res.send({
                message: "Udało się pobrać nawyki użytkownika",
                data,
            });
        } else {
            throw new HttpException(400, "Nie znaleziono użytkownika");
        }
    };

    private getHabit = async (
        req: Request<{ _id: string }, never, never, { nDays: number }> & ReqUser,
        res: Response
    ) => {
        const { _id } = req.params;
        const { nDays } = req.query;

        if (!_id) throw new HttpException(400, "Nie podano '_id' nawyku");

        if (!nDays) throw new HttpException(400, "Nie podano 'nDays'");

        const date = new Date();
        date.setDate(date.getDate() - nDays);

        if (_id) {
            const user = await this.user.findOne({ "habits._id": _id }, { "habits.$": 1 }).lean();
            const activity = await this.activity
                .find({ habit: _id, date: { $gte: date } }, { _id: 1, date: 1 })
                .sort({ date: 1 })
                .lean();

            const data = { habit: user.habits[0], activity };

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
            activities: [],
        };

        const createHabitDB = await this.user.updateOne({ username }, { $push: { habits: habit } });

        if (createHabitDB.modifiedCount === 0)
            throw new HttpException(400, "Nie udało się dodać nawyku");

        res.send({ message: "Udało się dodać nawyk", data: habit });
    };

    private editHabit = async (
        req: Request<never, never, EditHabitData["body"]> & ReqUser,
        res: Response
    ) => {
        const { _id, name, description, periodInDays } = req.body;
        const { username } = req.user;

        const editHabitDB = await this.user.updateOne(
            { username, "habits._id": _id },
            {
                $set: {
                    "habits.$.name": name,
                    "habits.$.description": description,
                    "habits.$.periodInDays": periodInDays,
                },
            }
        );

        if (editHabitDB.modifiedCount === 0)
            throw new HttpException(400, "Nie udało się edytować nawyku");

        res.send({ message: "Udało się edytować nawyk" });
    };

    private createGroups = async (
        req: Request<never, never, EditOrderHabitsData["body"]> & ReqUser,
        res: Response
    ) => {
        const { habitGroups } = req.body;
        const { username } = req.user;

        const habitGroupsDB = await this.user.findOneAndUpdate(
            { username },
            { $set: { habitGroups: habitGroups } },
            { new: true }
        );

        res.send({ message: "Udało się stworzyć grupy", data: habitGroupsDB.habitGroups });
    };

    private deleteHabit = async (
        req: Request<never, never, DeleteHabitData["body"]> & ReqUser,
        res: Response
    ) => {
        const { _id } = req.body;
        const { username } = req.user;

        const session = await mongoose.startSession();

        try {
            session.startTransaction();

            const user = await this.user
                .findOne({ username }, { habits: 1, habitGroups: 1 })
                .session(session);

            user.habits = user.habits.filter((habit) => habit._id != _id);

            user.habitGroups = user.habitGroups.map((group) => {
                group.habits = group.habits.filter((habit) => habit != _id);
                return group;
            });

            const db = await user.save({ session });

            console.log(db);

            await this.activity.deleteMany({ habit: _id }, { session });

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

        if (await this.activity.exists({ habit: habitID, date: date }))
            throw new HttpException(400, "Aktywność już istnieje");

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
        const { _id } = req.body;

        const dbResponse = await this.activity.deleteOne({ _id });

        if (dbResponse.deletedCount === 0)
            throw new HttpException(400, "Nie udało się usunąć aktywności");

        res.send({ message: "Udało się usunąć aktywność" });
    };
}
export default HabitController;
