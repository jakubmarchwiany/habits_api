import { Model, Types } from "mongoose";

export interface IActivity {
    _id: Types.ObjectId;
    date: Date;
    stepsDone?: number;
    done: boolean;
}
export type ActivityModel = Model<IActivity, unknown, unknown>;
