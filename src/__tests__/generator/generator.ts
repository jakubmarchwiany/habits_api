import fs from "fs";
import mongoose, { ConnectOptions } from "mongoose";
import path from "path";

import { ActivityModel } from "../../models/activity/activity";
import { UserModel } from "../../models/user/user";
import { ENV } from "../../utils/validate_env";

const { MONGO_URL } = ENV;

reloadDatabase();

export async function reloadDatabase(): Promise<void> {
	const options: ConnectOptions = {
		serverSelectionTimeoutMS: 1000
	};

	mongoose.set("strictQuery", true);

	await mongoose.connect(MONGO_URL, options);

	await clearDataFromDatabase();

	await loadDataToDatabase();

	console.log("Database reload");
}

async function clearDataFromDatabase(): Promise<void> {
	await UserModel.deleteMany({});

	await ActivityModel.deleteMany({});
}

type UserData = {
	_id: { $oid: string };
	dearId: { $oid: string };
	groupsOfHabits: { _id: { $oid: string }; habitsIds: { $oid: string }[]; name: string }[];
	habits: { _id: { $oid: string }; description: string; name: string; periodInDays: number }[];
	password: string;
	username: string;
};

type ActivityData = {
	_id: { $oid: string };
	date: { $date: Date };
	habitId: { $oid: string };
};

async function loadDataToDatabase(): Promise<void> {
	const usersPath = path.join(import.meta.dir, `./users.json`);
	const usersData = JSON.parse(fs.readFileSync(usersPath, "utf8")) as UserData[];

	const users = usersData.map((u) => {
		return {
			_id: u._id.$oid,
			dearId: u.dearId.$oid,
			groupsOfHabits: u.groupsOfHabits.map((g) => {
				const { _id, habitsIds, name } = g;

				return { _id: _id.$oid, habitsIds: habitsIds.map((h) => h.$oid), name };
			}),
			habits: u.habits.map((h) => {
				const { _id, description, name, periodInDays } = h;

				return { _id: _id.$oid, description, name, periodInDays };
			}),
			password: u.password,
			username: u.username
		};
	});

	await UserModel.insertMany(users);

	const activitiesPath = path.join(import.meta.dir, `./activities.json`);
	const activitiesData = JSON.parse(fs.readFileSync(activitiesPath, "utf8")) as ActivityData[];

	const activities = activitiesData.map((a) => {
		const { _id, date, habitId: habit } = a;

		return { _id: _id.$oid, date: date.$date, habitId: habit.$oid };
	});

	await ActivityModel.insertMany(activities);
}
