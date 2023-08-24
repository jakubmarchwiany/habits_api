import { model, Schema } from "mongoose";
import { IUser, UserModel } from "./user_interface";
import updateVersioningPlugin from "mongoose-update-versioning";
import { IHabit } from "./habit_interface";
import { IHabitGroups } from "./group_interface";

const userSchema = new Schema<IUser, UserModel>({
    username: { type: String, required: true },
    password: { type: String, required: true },
    habits: [new Schema<IHabit>({ name: String, description: String, periodInDays: Number })],
    habitGroups: [new Schema<IHabitGroups>({ name: String, habits: [String] })],
});

userSchema.plugin(updateVersioningPlugin);

const User = model<IUser, UserModel>("User", userSchema);
export default User;
