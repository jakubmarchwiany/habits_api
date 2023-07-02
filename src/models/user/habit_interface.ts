import { ObjectId, Schema } from "mongoose";
import { IActivity } from "../activity/activity_interface";

export interface IHabit {
    _id: string;
    name: string;
    activities?: IActivity[];
}
