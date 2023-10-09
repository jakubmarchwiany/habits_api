import { Router } from "express";
import mongoose, { Types } from "mongoose";

import { AuthRequest, MyResponse, authMiddleware } from "../../middleware/auth.middleware";
import { HttpException } from "../../middleware/exceptions/http.exception";
import {
	CreateHabitData,
	createHabitSchema
} from "../../middleware/schemas/habits/create_habit.schema";
import {
	DeleteHabitData,
	deleteHabitSchema
} from "../../middleware/schemas/habits/delete_habit.schema";
import {
	GetActivitiesData,
	GetActivitiesSchema
} from "../../middleware/schemas/habits/get_activities.schema";
import { GetHabitsData, getHabitsSchema } from "../../middleware/schemas/habits/get_habits.schema";
import {
	UpdateGroupsOfHabitsData,
	updateGroupsOfHabitsSchema
} from "../../middleware/schemas/habits/update_groups_of_habits.schema";
import {
	UpdateHabitData,
	updateHabitSchema
} from "../../middleware/schemas/habits/update_habit.schema";
import { validate } from "../../middleware/validate.middleware";
import { Activity, ActivityModel } from "../../models/activity/activity";
import { GroupOfHabits } from "../../models/user/group_of_habits";
import { Habit, HabitWithActivity } from "../../models/user/habit";
import { UserModel } from "../../models/user/user";
import { catchError } from "../../utils/catch_error";
import { parseBoolean } from "../../utils/parse_boolean";
import { Controller } from "../controller.type";
import { prepareHabits } from "./prepare_habits/prepareHabits";

export class HabitsController implements Controller {
	public path = "/habits";
	public router = Router();

	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		this.router.all("*", authMiddleware);

		this.router.get("", validate(getHabitsSchema), catchError(this.getHabits));

		this.router.post(
			"/groupsOfHabits/update",
			validate(updateGroupsOfHabitsSchema),
			catchError(this.updateGroupsOfHabits)
		);

		this.router.post(`/-/create`, validate(createHabitSchema), catchError(this.createHabit));

		this.router.post(
			"/:habitId/update",
			validate(updateHabitSchema),
			catchError(this.updateHabit)
		);

		this.router.post(
			"/:habitId/delete",
			validate(deleteHabitSchema),
			catchError(this.deleteHabit)
		);

		this.router.get(
			`/:habitId/activities`,
			validate(GetActivitiesSchema),
			catchError(this.getActivities)
		);
	}

	private getHabits = async (
		req: AuthRequest<undefined, undefined, undefined, GetHabitsData["query"]>,
		res: MyResponse<{
			habits: HabitWithActivity[];
			groupsOfHabits: GroupOfHabits[];
		}>
	): Promise<void> => {
		const { dateFrom, myHabits } = req.query;

		const searchFromData = new Date(dateFrom);

		searchFromData.setHours(12, 0, 0, 0);

		const currentUser = parseBoolean(myHabits) ? req.user.userId : req.user.dearId;

		const user = await UserModel.findOne(
			{ _id: currentUser },
			{ groupsOfHabits: 1, habits: 1 }
		).lean();

		if (user !== null) {
			const habitsExt = await prepareHabits(user.habits, searchFromData);

			const data = {
				habits: habitsExt,
				groupsOfHabits: user.groupsOfHabits
			};

			res.send({
				data,
				message: "Udało się pobrać nawyki"
			});
		} else {
			throw new HttpException(400, "Nie znaleziono użytkownika");
		}
	};

	private createHabit = async (
		req: AuthRequest<undefined, undefined, CreateHabitData["body"], undefined>,
		res: MyResponse<{ habitId: Types.ObjectId }>
	): Promise<void> => {
		const { description, name, periodInDays } = req.body;
		const { userId } = req.user;

		const habitId = new mongoose.Types.ObjectId();

		const habit: Habit = {
			_id: habitId,
			name,
			description,
			periodInDays
		};

		const result = await UserModel.updateOne({ _id: userId }, { $push: { habits: habit } });

		if (result.modifiedCount === 0) {
			throw new HttpException(400, "Nie udało się stworzyć nawyku");
		}

		res.send({ data: { habitId }, message: "Udało się stworzyć nawyk" });
	};

	private updateHabit = async (
		req: AuthRequest<UpdateHabitData["params"], undefined, UpdateHabitData["body"], undefined>,
		res: MyResponse<undefined>
	): Promise<void> => {
		const { newDescription, newName, newPeriodInDays } = req.body;
		const { userId } = req.user;
		const { habitId } = req.params;

		const result = await UserModel.updateOne(
			{ _id: userId, "habits._id": habitId },
			{
				$set: {
					"habits.$.name": newName,
					"habits.$.description": newDescription,
					"habits.$.periodInDays": newPeriodInDays
				}
			}
		);

		if (result.modifiedCount === 0) {
			throw new HttpException(400, "Nie udało się edytować nawyku");
		}

		res.send({ message: "Udało się edytować nawyk" });
	};

	private deleteHabit = async (
		req: AuthRequest<DeleteHabitData["params"], undefined, undefined, undefined>,
		res: MyResponse<undefined>
	): Promise<void> => {
		const { habitId } = req.params;
		const { userId } = req.user;

		const session = await mongoose.startSession();

		try {
			session.startTransaction();

			const result = await UserModel.updateOne(
				{ _id: userId },
				{
					$pull: {
						habits: { _id: habitId },
						"groupsOfHabits.$[].habitsIds": habitId
					}
				},
				{ session }
			);

			if (result.modifiedCount === 0) {
				throw new Error();
			}

			await ActivityModel.deleteMany({ habitId }, { session });

			await session.commitTransaction();

			res.send({ message: "Udało się usunąć nawyk" });
		} catch (error) {
			await session.abortTransaction();

			throw new HttpException(400, "Nie udało się usunąć nawyku");
		} finally {
			session.endSession();
		}
	};

	private updateGroupsOfHabits = async (
		req: AuthRequest<undefined, undefined, UpdateGroupsOfHabitsData["body"], undefined>,
		res: MyResponse<{ groupsOfHabits: GroupOfHabits[] }>
	): Promise<void> => {
		const { newGroupsOfHabits } = req.body;
		const { userId } = req.user;

		const user = await UserModel.findOneAndUpdate(
			{ _id: userId },
			{ $set: { groupsOfHabits: newGroupsOfHabits } },
			{ new: true }
		).select("groupsOfHabits");

		console.log(user);

		if (user !== null) {
			const { groupsOfHabits } = user;

			res.send({
				data: { groupsOfHabits },
				message: "Udało się edytować grupy"
			});
		} else {
			throw new HttpException(400, "Nie udało się edytować grup");
		}
	};

	private getActivities = async (
		req: AuthRequest<
			GetActivitiesData["params"],
			undefined,
			undefined,
			GetActivitiesData["query"]
		>,
		res: MyResponse<{ activities: Activity[] }>
	): Promise<void> => {
		const { habitId } = req.params;
		const { dateFrom } = req.query;

		const searchData = new Date(dateFrom);

		searchData.setHours(12, 0, 0, 0);

		const activities = await ActivityModel.find(
			{ habitId, date: { $gte: searchData } },
			{ _id: 1, date: 1 }
		)
			.sort({ date: 1 })
			.lean();

		res.send({
			data: { activities },
			message: "Udało się pobrać aktywności"
		});
	};
}
