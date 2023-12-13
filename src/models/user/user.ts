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
	dearId: { required: true, type: SchemaTypes.ObjectId },
	groupsOfHabits: { default: [], required: true, type: [groupOfHabitsSchema] },
	habits: { default: [], required: true, type: [habitSchema] },
	password: { required: true, type: String },
	username: { required: true, type: String }
});

type UserH = HydratedDocument<InferSchemaType<typeof userSchema>>;
type User = FlattenMaps<InferSchemaType<typeof userSchema>>;

const UserModel = model("User", userSchema);

export { User, UserH, UserModel };
