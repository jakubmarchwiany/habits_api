import { Types } from "mongoose";

import { Activity, ActivityModel } from "../../../models/activity/activity";

type UserActivitiesDB = {
	_id: Types.ObjectId;
	activities: Activity[];
};

export const aggregateActivities = async (
	dateFrom: Date,
	habitsIds: Types.ObjectId[]
): Promise<UserActivitiesDB[]> => {
	return await ActivityModel.aggregate<UserActivitiesDB>([
		{
			$match: {
				date: { $gte: dateFrom },
				habitId: { $in: habitsIds }
			}
		},
		{
			$group: {
				_id: "$habitId",
				activities: { $push: "$$ROOT" }
			}
		},
		{
			$project: {
				activities: {
					_id: 1,
					date: 1
				}
			}
		},
		{
			$unwind: "$activities"
		},
		{
			$sort: {
				"activities.date": 1
			}
		},
		{
			$group: {
				_id: "$_id",
				activities: { $push: "$activities" }
			}
		}
	]);
};
