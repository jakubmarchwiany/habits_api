import { Schema } from "mongoose";
import { IActivity } from "../activity/activity_interface";

export interface IHabit {
    _id?: Schema.Types.ObjectId;
    name: string;
    n_steps: number;
    activities?: IActivity[];
}
