import { IActivity } from "../models/activity/activity_interface";
import Activity from "../models/activity/activity_model";

export const getUserActivities = (date: Date, habitsID: string[]) => {
    return new Promise(async (resolve, reject) =>
        resolve(
            await Activity.aggregate([
                {
                    $match: {
                        habit: { $in: habitsID },
                        date: { $gte: date },
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
};

export type UserActivitiesDB = {
    _id: string;
    activities: IActivity[];
};
