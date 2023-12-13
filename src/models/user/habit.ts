import { InferSchemaType, Schema, SchemaTypes } from "mongoose";

import { Activity } from "../activity/activity";

const habitSchema = new Schema({
	_id: { required: true, type: SchemaTypes.ObjectId },
	description: { type: String },
	name: { required: true, type: String },
	periodInDays: { required: true, type: Number }
});

type Habit = InferSchemaType<typeof habitSchema>;
type HabitWithActivity = Habit & { activities: [] | Activity[] };

export { Habit, HabitWithActivity, habitSchema };
