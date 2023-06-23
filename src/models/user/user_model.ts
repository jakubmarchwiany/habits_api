import { model, Schema } from "mongoose";
import { IHabit, IUser, UserModel } from "./user_interface";
import updateVersioningPlugin from "mongoose-update-versioning";

const userSchema = new Schema<IUser, UserModel>({
    username: { type: String, required: true },
    password: { type: String, required: true },
    habits: new Schema<IHabit>({ name: String, n_steps: Number }),
});

// userSchema.pre("findOneAndUpdate", function () {
//     const update = this.getUpdate();
//     if (update.__v != null) {
//         delete update.__v;
//     }
//     const keys = ["$set", "$setOnInsert"];
//     for (const key of keys) {
//         if (update[key] != null && update[key].__v != null) {
//             delete update[key].__v;
//             if (Object.keys(update[key]).length === 0) {
//                 delete update[key];
//             }
//         }
//     }
//     update.$inc = update.$inc || {};
//     update.$inc.__v = 1;
// });

userSchema.plugin(updateVersioningPlugin);

const User = model<IUser, UserModel>("User", userSchema);
export default User;
