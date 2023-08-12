import { ObjectId, Schema } from "mongoose";
import { IActivity } from "../activity/activity_interface";

export interface IHabit {
    _id: string;
    name: string;
    description: string;
    periodInDays: number;
    activities?: IActivity[];
}
