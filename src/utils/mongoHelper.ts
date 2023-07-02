import User from "../models/user/user_model";
import bcrypt from "bcrypt";

export const mongoHelper = async () => {
    // createUser("julia", "kochamciebiemilion")
};

//create user mongodb
const createUser = async (username: string, password: string) => {
    password = await bcrypt.hash(password, 10);
    const user = new User({ username, password });
    await user.save();
    return user;
};
