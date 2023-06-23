import { model, Schema } from "mongoose";
import { ActivityModel, IActivity } from "./activity_interface";

const activitySchema = new Schema<IActivity, ActivityModel>({
    date: { type: Date, required: true },
    n_steps_done: { type: Number, required: true },
    activities: [{ type: Schema.Types.ObjectId, ref: "Activity" }],
});

const Activity = model<IActivity, ActivityModel>("Activity", activitySchema);
export default Activity;
