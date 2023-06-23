import { Model, Types } from "mongoose";

export interface IActivity {
    _id: Types.ObjectId;
    date: Date;
    n_steps_done?: number;
    done: boolean;
}
export type ActivityModel = Model<IActivity, unknown, unknown>;
