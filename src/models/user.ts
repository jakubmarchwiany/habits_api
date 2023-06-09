import Activity from "./user/activity_model";

export type User = {
    username: string;
    password: string;
};

export type Activity = {
    data: string;
    steps?: number;
};

export type Habit = {
    name: string;
    steps: number;
    activities: [string, number?][];
};

export type UserData = {
    version: number;
    userName: string;
    habits: Habit[];
};
