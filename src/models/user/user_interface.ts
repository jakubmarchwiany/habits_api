import { Model, ObjectId } from "mongoose";
import { IHabit } from "./habit_interface";
import { IHabitGroups } from "./group_interface";

export interface IUser {
    _id: ObjectId;
    username: string;
    password: string;
    habits: IHabit[];
    habitGroups: IHabitGroups[];
}
export type UserModel = Model<IUser, unknown, unknown>;
