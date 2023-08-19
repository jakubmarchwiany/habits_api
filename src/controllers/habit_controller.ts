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
        const { id } = req.body;
        const { username } = req.user;

        const session = await mongoose.startSession();
        console.log(id);
        try {
            session.startTransaction();

            const user = await this.user
                .findOne({ username }, { habits: 1, habitGroups: 1 })
                .session(session);

            user.habits = user.habits.filter((habit) => habit._id != id);

            user.habitGroups = user.habitGroups.map((group) => {
                group.habits = group.habits.filter((habit) => habit != id);
                return group;
            });

            const db = await user.save({ session });

            console.log(db);

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
