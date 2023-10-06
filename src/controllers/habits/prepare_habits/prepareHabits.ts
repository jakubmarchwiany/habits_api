import { Habit, HabitWithActivity } from "../../../models/user/habit";
import { aggregateActivities } from "./aggregateActivities";

export const prepareHabits = async (
	habits: Habit[],
	dataFrom: Date
): Promise<HabitWithActivity[]> => {
	const habitsIds = habits.map((habit) => habit._id);

	const activities = await aggregateActivities(dataFrom, habitsIds);

	const habitsExt = habits.map((h): HabitWithActivity => {
		return { ...h, activities: [] };
	});

	for (let i = 0; i < habitsExt.length; i++) {
		for (let j = 0; j < activities.length; j++) {
			if (habitsExt[i]._id.equals(activities[j]._id)) {
				habitsExt[i].activities = activities[j].activities;
				break;
			}
		}
	}

	return habitsExt;
};
