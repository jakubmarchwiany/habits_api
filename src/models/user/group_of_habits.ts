import { InferSchemaType, Schema, SchemaTypes } from "mongoose";

const groupOfHabitsSchema = new Schema({
	_id: { required: true, type: SchemaTypes.ObjectId },
	name: { required: true, type: String },
	habitsIds: { required: true, type: [SchemaTypes.ObjectId] }
});

type GroupOfHabits = InferSchemaType<typeof groupOfHabitsSchema>;

export { GroupOfHabits, groupOfHabitsSchema };
