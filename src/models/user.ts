export type User = {
    username: string;
    password: string;
};

export type activity = {
    data: Date;
    quantity?: number;
};

export type Habit = {
    name: string;
    numberOfActivitiesPerDay: number;
    activities: [data: string, quantity?: number][];
};

export type UserData = {
    version: number;
    userName: string;
    habits: Habit[];
};
