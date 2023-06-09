import { Model, ObjectId, Schema } from "mongoose";

export type Habit = {
    name: string;
    numberOfActivitiesPerDay: number;
    activities: [data: string, quantity?: number][];
};

export interface IUser {
    _id: string;
    version: number;
    userName: string;
    habitsInfo: Habit[];
}
export type UserModel = Model<IUser, unknown, unknown>;
