import { Model, Types } from "mongoose";

export interface IActivity {
    _id: Types.ObjectId;
    habit: Types.ObjectId;
    date: Date;
}

export type ActivityModel = Model<IActivity, unknown, unknown>;
