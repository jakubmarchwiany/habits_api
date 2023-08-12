import User from "../models/user/user_model";
import bcrypt from "bcrypt";

export const mongoHelper = async () => {
    // createUser("kuba", "dev");
};

//create user mongodb
const createUser = async (username: string, password: string) => {
    password = await bcrypt.hash(password, 10);
    const user = new User({
        username,
        password,
        habits: [],
        habitsGroups: [],
    });
    await user.save();
    return user;
};
