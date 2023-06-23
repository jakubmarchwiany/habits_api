import { Model, Schema } from "mongoose";

export interface IHabit {
    _id?: string;
    name: string;
    n_steps: number;
}

export interface IUser {
    _id: string;
    username: string;
    password: string;
    habits: IHabit[];
}
export type UserModel = Model<IUser, unknown, unknown>;
