import { Router } from "express";
import mongoose, { Types } from "mongoose";

import { AuthRequest, MyResponse, authMiddleware } from "../../middleware/auth.middleware";
import { HttpException } from "../../middleware/exceptions/http.exception";
import {
	CreateActivityData,
	createActivitySchema
} from "../../middleware/schemas/activities/create_activity.schema";
import {
	DeleteActivityData,
	deleteActivitySchema
} from "../../middleware/schemas/activities/delete_activity.schema";
import { validate } from "../../middleware/validate.middleware";
import { ActivityModel } from "../../models/activity/activity";
import { catchError } from "../../utils/catch_error";
import { Controller } from "../controller.type";

export class ActivityController implements Controller {
	public path = "/habits/-/activities";
	public router = Router();

	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		this.router.all("*", authMiddleware);

		this.router.post(
			"/-/create",
			validate(createActivitySchema),
			catchError(this.createActivity)
		);

		this.router.post(
			"/:activityId/delete",
			validate(deleteActivitySchema),
			catchError(this.deleteActivity)
		);
	}

	private createActivity = async (
		req: AuthRequest<undefined, undefined, CreateActivityData["body"], undefined>,
		res: MyResponse<{ activityId: Types.ObjectId }>
	): Promise<void> => {
		const { date, habitId } = req.body;

		const activityDate = new Date(date).setHours(12, 0, 0, 0);

		if (await ActivityModel.exists({ date: activityDate, habitId })) {
			throw new HttpException(400, "Aktywność już istnieje");
		}

		const createActivityDB = await ActivityModel.create({
			_id: new mongoose.Types.ObjectId(),
			date: activityDate,
			habitId
		});

		res.send({
			data: { activityId: createActivityDB._id },
			message: "Udało się dodać aktywność"
		});
	};

	private deleteActivity = async (
		req: AuthRequest<DeleteActivityData["params"], undefined, undefined, undefined>,
		res: MyResponse<never>
	): Promise<void> => {
		const { activityId } = req.params;

		try {
			const result = await ActivityModel.deleteOne({ _id: activityId });

			if (result.deletedCount === 0) {
				throw new Error();
			}
			res.send({ message: "Udało się usunąć aktywność" });
		} catch (e) {
			throw new HttpException(400, "Nie udało się usunąć aktywności");
		}
	};
}
