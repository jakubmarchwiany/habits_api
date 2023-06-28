import { model, Schema } from "mongoose";
import { ActivityModel, IActivity } from "./activity_interface";

const activitySchema = new Schema<IActivity, ActivityModel>(
    {
        habit: { type: Schema.Types.ObjectId, required: true, index: true },
        date: { type: Date, required: true, index: true },
        step: { type: Number },
    },
    { versionKey: false }
);

const Activity = model<IActivity, ActivityModel>("Activity", activitySchema);
export default Activity;
