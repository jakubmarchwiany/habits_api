import { Model, Schema } from "mongoose";
import { IHabit } from "./habit_interface";

export interface IUser {
    _id: Schema.Types.ObjectId;
    username: string;
    password: string;
    habits: IHabit[];
}
export type UserModel = Model<IUser, unknown, unknown>;
