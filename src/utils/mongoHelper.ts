import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import Activity from "../models/activity/activity_model";
import User from "../models/user/user_model";

export const mongoHelper = async () => {
    // await restartDataBase();
};

const restartDataBase = async () => {
    await clearDataBase();
    await createUser("kuba", "kochamciebiemilion");
    await prepareHabits("kuba");
    await prepareHabitGroups("kuba");
    await prepareActivities("kuba");

    await createUser("julia", "kochamciebiemilion");
    await prepareHabits("julia");
    await prepareHabitGroups("julia");
    await prepareActivities("julia");
};

const clearDataBase = async () => {
    await User.deleteMany({});
    await Activity.deleteMany({});
};

const createUser = async (username: string, password: string) => {
    password = await bcrypt.hash(password, 10);
    const user = new User({
        username,
        password,
        habits: [],
        habitsGroups: [],
    });
    await user.save();
};

const prepareHabits = async (username: string) => {
    try {
        const filePath = path.join(__dirname, `./${username}.json`);
        const data = fs.readFileSync(filePath, "utf8");
        const jsonData = JSON.parse(data);

        const userHabits = jsonData.habits;

        const habits = userHabits.map((habit: any) => {
            return {
                _id: habit._id.$oid,
                name: habit.name,
                description: "",
                periodInDays: 1,
            };
        });

        await User.updateOne({ username }, { $set: { habits: habits } });
    } catch (err) {
        console.error("Error:", err);
    }
};

const prepareHabitGroups = async (username: string) => {
    try {
        const filePath = path.join(__dirname, `./${username}.json`);
        const data = fs.readFileSync(filePath, "utf8");
        const jsonData = JSON.parse(data);

        const userHabitGroups = jsonData.habitGroups;

        const groups = userHabitGroups.map((group: any) => {
            return {
                name: group.name,
                habits: group.habits,
            };
        });

        await User.updateOne({ username }, { $set: { habitGroups: groups } });
    } catch (err) {
        console.error("Error:", err);
    }
};

const prepareActivities = async (username: string) => {
    const user = await User.findOne({ username });

    const habits = user?.habits;

    const all = [];
    if (habits) {
        for (let i = 0; i < 41; i++) {
            habits.map((habit: any) => {
                if (Math.random() > 0.66666)
                    all.push({
                        habit: habit._id,
                        date: new Date(new Date().setDate(new Date().getDate() - i)),
                    });
            });
        }

        await Activity.insertMany(all);
    }
};
