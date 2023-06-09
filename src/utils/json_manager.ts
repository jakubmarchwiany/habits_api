import { readFileSync, writeFileSync } from "jsonfile";
import path from "path";
import { UserData } from "../models/user";

export const getUserDataFromJson = (userName: string): UserData => {
    const data = readFileSync(path.join(__dirname + "../../data/") + `${userName}.json`, "utf8");
    return data;
};

export const saveUserDataToJson = (userName: string, userData: UserData) => {
    userData.version++;

    writeFileSync(path.join(__dirname + "../../data/") + `${userName}.json`, userData);
};
