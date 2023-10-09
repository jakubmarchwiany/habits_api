import {
	FlattenMaps,
	HydratedDocument,
	InferSchemaType,
	Schema,
	SchemaTypes,
	model
} from "mongoose";

const activitySchema = new Schema({
	_id: { required: true, type: SchemaTypes.ObjectId },
	date: { index: true, required: true, type: Date },
	habitId: { index: true, required: true, type: SchemaTypes.ObjectId }
});

type ActivityH = HydratedDocument<InferSchemaType<typeof activitySchema>>;
type Activity = FlattenMaps<InferSchemaType<typeof activitySchema>>;

const ActivityModel = model("Activity", activitySchema);

export { Activity, ActivityH, ActivityModel };
