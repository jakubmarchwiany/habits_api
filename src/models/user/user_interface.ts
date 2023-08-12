import { Model, ObjectId } from "mongoose";
import { IHabit } from "./habit_interface";

export interface IUser {
    _id: ObjectId;
    username: string;
    password: string;
    habits: IHabit[];
    habitsGroups: {
        name: string;
        habits: ObjectId[];
    }[];
}
export type UserModel = Model<IUser, unknown, unknown>;
