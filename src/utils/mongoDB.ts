import { IActivity } from "../models/activity/activity_interface";
import Activity from "../models/activity/activity_model";

export const getUserActivities = (dateFrom: Date, habitsID: string[]) => {
    return new Promise(async (resolve, reject) =>
        resolve(
            await Activity.aggregate([
                {
                    $match: {
                        habit: { $in: habitsID },
                        date: { $gte: dateFrom },
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
                {
                    $unwind: "$activities",
                },
                {
                    $sort: {
                        "activities.date": 1, // Sort by date in ascending order, use -1 for descending order
                    },
                },
                {
                    $group: {
                        _id: "$_id",
                        activities: { $push: "$activities" },
                    },
                },
            ])
        )
    );
};

export type UserActivitiesDB = {
    _id: string;
    activities: IActivity[];
};
