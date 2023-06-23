import { model, Schema } from "mongoose";
import { HabitModel, IHabit } from "./habit_interface";

const habitSchema = new Schema<IHabit, HabitModel>({
    name: { type: String, required: true },
    n_steps: { type: Number, required: true },
    activities: [{ type: Schema.Types.ObjectId, ref: "Activity" }],
});

const Habit = model<IHabit, HabitModel>("Habit", habitSchema);
export default Habit;
