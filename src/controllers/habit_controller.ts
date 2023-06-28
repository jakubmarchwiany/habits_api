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

class HabitController implements Controller {
    public router = Router();
    public path = "/user";
    private readonly user = User;
    private readonly activity = Activity;

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
            catchError(this.createActivity)
        );
        this.router.post(
            "/habit/activity/delete",
            authMiddleware,
            validate(deleteActivitySchema),
            catchError(this.deleteActivity)
        );
    }

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

            const logUserActivities = new Promise(async (resolve, reject) =>
                resolve(
                    await this.activity.aggregate([
                        {
                            $match: {
                                habit: { $in: logUserHabitsID },
                                date: { $gte: dateAgo },
                            },
                        },
                        {
                            $group: {
                                _id: "$habit",
                                activities: { $push: "$$ROOT" },
                            },
                        },
                        {
                            $project: {
                                activities: {
                                    _id: 1,
                                    date: 1,
                                },
                            },
                        },
                    ])
                )
            );

            const otherUserActivities = new Promise(async (resolve, reject) =>
                resolve(
                    await this.activity.aggregate([
                        {
                            $match: {
                                habit: { $in: otherUserHabitsID },
                                date: { $gte: dateAgo },
                            },
                        },
                        {
                            $group: {
                                _id: "$habit",
                                activities: { $push: "$$ROOT" },
                            },
                        },
                        {
                            $project: {
                                activities: {
                                    _id: 1,
                                    date: 1,
                                },
                            },
                        },
                    ])
                )
            );

            Promise.all([logUserActivities, otherUserActivities]).then((values) => {
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

    private createHabit = async (
        req: Request<never, never, CreateHabitData["body"]> & ReqUser,
        res: Response
    ) => {
        const { name, n_steps } = req.body;
        const { id } = req.user;

        const habit: IHabit = { name: name, n_steps: n_steps };

        const dbResponse = await this.user.updateOne({ _id: id }, { $push: { habits: habit } });

        if (dbResponse.modifiedCount === 0)
            throw new HttpException(400, "Nie udało się dodać nawyku");

        res.send({ message: "Udało się dodać nawyk" });
    };

    private editHabitName = async (
        req: Request<never, never, EditHabitNameData["body"]> & ReqUser,
        res: Response
    ) => {
        const { id, newName } = req.body;
        const { id: userID } = req.user;

        const dbResponse = await this.user.updateOne(
            { _id: userID, "habits._id": id },
            { $set: { "habits.$.name": newName } }
        );

        console.log(id);

        if (dbResponse.modifiedCount === 0)
            throw new HttpException(400, "Nie udało się zmienić nazwy nawyku");

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

        const dbResponse = await this.user.updateOne({ _id: id }, { $set: { habits: newOrder } });

        if (dbResponse.modifiedCount === 0)
            throw new HttpException(400, "Nie udało się zmienić kolejność nawyków");

        res.send({ message: "Udało się zmienić kolejność nawyków" });
    };

    private deleteHabit = async (
        req: Request<never, never, DeleteHabitData["body"]> & ReqUser,
        res: Response
    ) => {
        const { id } = req.body;
        const { id: userID } = req.user;

        const dbResponse = await this.user.updateOne(
            { _id: userID, "habits._id": id },
            { $pull: { habits: { _id: id } } }
        );

        if (dbResponse.modifiedCount === 0)
            throw new HttpException(400, "Nie udało się usunąć nawyku");

        res.send({ message: "Udało się usunąć nawyk" });
    };

    private createActivity = async (
        req: Request<never, never, AddActivityData["body"]> & ReqUser,
        res: Response
    ) => {
        const { id, date } = req.body;

        const dbResponse = await this.activity.create({ habit: id, date: date });

        res.send({ message: "Udało się dodać aktywność", data: dbResponse._id });
    };

    // private editActivity = async (
    //     req: Request<never, never, EditActivityData["body"]> & ReqUser,
    //     res: Response
    // ) => {
    //     const { id, date } = req.body;
    // };

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
