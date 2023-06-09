import { Habit } from "./Habit";

export type UserData = {
    version: number;
    userName: string;
    habits: Habit[];
};
