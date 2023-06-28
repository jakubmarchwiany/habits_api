import { Model, Types } from "mongoose";

export interface IActivity {
    _id: Types.ObjectId;
    habit: Types.ObjectId;
    date: Date;
    step?: number;
}
export type ActivityModel = Model<IActivity, unknown, unknown>;
