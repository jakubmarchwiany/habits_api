import {
	FlattenMaps,
	HydratedDocument,
	InferSchemaType,
	Schema,
	SchemaTypes,
	model
} from "mongoose";

import { groupOfHabitsSchema } from "./group_of_habits";
import { habitSchema } from "./habit";

const userSchema = new Schema({
	username: { required: true, type: String },
	password: { required: true, type: String },
	dearId: { required: true, type: SchemaTypes.ObjectId },
	habits: { default: [], required: true, type: [habitSchema] },
	groupsOfHabits: { default: [], required: true, type: [groupOfHabitsSchema] }
});

type UserH = HydratedDocument<InferSchemaType<typeof userSchema>>;
type User = FlattenMaps<InferSchemaType<typeof userSchema>>;

const UserModel = model("User", userSchema);

export { User, UserH, UserModel };
