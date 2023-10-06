import fs from "fs";
import mongoose, { ConnectOptions } from "mongoose";
import path from "path";

import { ActivityModel } from "../../models/activity/activity";
import { UserModel } from "../../models/user/user";
import { ENV } from "../validate_env";

const { MONGO_URL } = ENV;

const connectToTheDatabase = (): void => {
	const options: ConnectOptions = {
		serverSelectionTimeoutMS: 1000
	};

	mongoose.set("strictQuery", true);

	mongoose
		.connect(MONGO_URL, options)
		.then(() => {
			console.log("Connected to the database");

			restartDataBase();
		})
		.catch(() => {
			console.log("Error connecting to the database");
		});
};

connectToTheDatabase();

async function restartDataBase(): Promise<void> {
	await clearDataFromDatabase();

	await loadDataToDatabase();

	console.log("Server restart");
}

async function clearDataFromDatabase(): Promise<void> {
	await UserModel.deleteMany({});

	await ActivityModel.deleteMany({});
}

type UserData = {
	_id: { $oid: string };
	username: string;
	password: string;
	dearId: string;
	habits: { _id: { $oid: string }; name: string; description: string; periodInDays: number }[];
	groupsOfHabits: { _id: { $oid: string }; name: string; habits: string[] }[];
};

type ActivityData = {
	_id: { $oid: string };
	date: { $date: Date };
	habit: { $oid: string };
};

async function loadDataToDatabase(): Promise<void> {
	const usersPath = path.join(import.meta.dir, `./users.json`);
	const usersData = JSON.parse(fs.readFileSync(usersPath, "utf8")) as UserData[];

	const users = usersData.map((u) => {
		return {
			_id: u._id.$oid,
			username: u.username,
			password: u.password,
			dearId: u.dearId,
			habits: u.habits.map((h) => {
				const { _id, description, name, periodInDays } = h;

				return { _id: _id.$oid, name, description, periodInDays };
			}),
			groupsOfHabits: u.groupsOfHabits.map((g) => {
				const { _id, habits, name } = g;

				return { _id: _id.$oid, name, habitsIds: habits };
			})
		};
	});

	await UserModel.insertMany(users);

	const activitiesPath = path.join(import.meta.dir, `./activities.json`);
	const activitiesData = JSON.parse(fs.readFileSync(activitiesPath, "utf8")) as ActivityData[];

	const activities = activitiesData.map((a) => {
		const { _id, date, habit } = a;

		return { _id: _id.$oid, date: date.$date, habitId: habit.$oid };
	});

	await ActivityModel.insertMany(activities);
}
