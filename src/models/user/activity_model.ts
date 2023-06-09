import { model, Schema } from "mongoose";
import { IActivity } from "./activity_interface";
import { IUser, UserModel } from "./user-interface";

const activitySchema = new Schema<IActivity, UserModel>({
    _id: Schema.Types.ObjectId,
    date: { type: Date, required: true },
    stepsDone: { type: Number, required: false },
    done: { type: Boolean, required: false },
});

const Activity = model<IUser, UserModel>("Activity", activitySchema);
export default Activity;
