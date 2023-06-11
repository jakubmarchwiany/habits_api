import { Habit } from "./habit";

export type UserData = {
    version: number;
    userName: string;
    habits: Habit[];
};
