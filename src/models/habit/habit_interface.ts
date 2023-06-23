import { Model, Schema } from "mongoose";

export interface IHabit {
    name: string;
    n_steps: number;
    activities: [Schema.Types.ObjectId];
}
export type HabitModel = Model<IHabit, unknown, unknown>;
