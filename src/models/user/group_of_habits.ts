import { InferSchemaType, Schema, SchemaTypes } from "mongoose";

const groupOfHabitsSchema = new Schema({
	_id: { required: true, type: SchemaTypes.ObjectId },
	habitsIds: { required: true, type: [SchemaTypes.ObjectId] },
	name: { required: true, type: String }
});

type GroupOfHabits = InferSchemaType<typeof groupOfHabitsSchema>;

export { GroupOfHabits, groupOfHabitsSchema };
