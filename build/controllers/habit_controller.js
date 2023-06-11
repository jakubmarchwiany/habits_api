"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uniqid_1 = __importDefault(require("uniqid"));
const authentication_1 = __importDefault(require("../middleware/authentication"));
const catch_error_1 = __importDefault(require("../middleware/catch_error"));
const add_activity_schema_1 = __importDefault(require("../middleware/schemas/habit/add_activity_schema"));
const create_habit_schema_1 = __importDefault(require("../middleware/schemas/habit/create_habit_schema"));
const delete_habit_schema_1 = __importDefault(require("../middleware/schemas/habit/delete_habit_schema"));
const edit_habit_name_schema_1 = __importDefault(require("../middleware/schemas/habit/edit_habit_name_schema"));
const edit_habits_order_schema_1 = __importDefault(require("../middleware/schemas/habit/edit_habits_order_schema"));
const validate_1 = __importDefault(require("../middleware/validate"));
const json_manager_1 = require("../utils/json_manager");
class HabitController {
    constructor() {
        this.router = (0, express_1.Router)();
        this.path = "/user";
        this.kubaData = (0, json_manager_1.getUserDataFromJson)("kuba");
        this.juliaData = (0, json_manager_1.getUserDataFromJson)("julia");
        this.getUserData = async (req, res) => {
            const { userName } = req.user;
            const juliaData = JSON.parse(JSON.stringify(this.juliaData));
            const kubaData = JSON.parse(JSON.stringify(this.kubaData));
            juliaData.habits.forEach((habit) => {
                return habit.activities.length > 60 && habit.activities.splice(-60);
            });
            kubaData.habits.forEach((habit) => {
                return habit.activities.length > 60 && habit.activities.splice(-60);
            });
            const data = [];
            if (userName === "kuba") {
                data.push(kubaData);
                data.push(juliaData);
            }
            else {
                data.push(juliaData);
                data.push(kubaData);
            }
            res.send({ message: "Udało się pobrać dane użytkownika", data });
        };
        this.createHabit = async (req, res) => {
            const { name } = req.body;
            const { userName } = req.user;
            const userData = userName == "kuba" ? this.kubaData : this.juliaData;
            const newHabit = {
                id: (0, uniqid_1.default)(),
                name,
                activities: [],
            };
            userData.habits.push(newHabit);
            (0, json_manager_1.saveUserDataToJson)(userName, userData);
            res.send({ message: "Udało się stworzyć nawyk", data: newHabit });
        };
        this.editHabitName = async (req, res) => {
            const { id, newName } = req.body;
            const { userName } = req.user;
            const userData = userName === "kuba" ? this.kubaData : this.juliaData;
            const habit = this.findHabitByID(id, userData.habits);
            habit.name = newName;
            (0, json_manager_1.saveUserDataToJson)(userName, userData);
            res.send({ message: "Udało się zmienić nazwę nawyku" });
        };
        this.editHabitsOrder = async (req, res) => {
            const { habitsID } = req.body;
            const { userName } = req.user;
            const userData = userName === "kuba" ? this.kubaData : this.juliaData;
            const sortedHabits = [];
            for (const habitId of habitsID) {
                const habit = userData.habits.find((h) => h.id === habitId);
                if (habit) {
                    sortedHabits.push(habit);
                }
            }
            if (sortedHabits.length !== userData.habits.length) {
                return res.status(400).send({ message: "Niepoprawne ID nawyku" });
            }
            userData.habits = sortedHabits;
            (0, json_manager_1.saveUserDataToJson)(userName, userData);
            res.send({ message: "Udało się zmienić kolejność nawyków" });
        };
        this.deleteHabit = async (req, res) => {
            const { id } = req.body;
            const { userName } = req.user;
            const userData = userName === "kuba" ? this.kubaData : this.juliaData;
            const habitIndex = userData.habits.findIndex((habit) => habit.id === id);
            userData.habits.splice(habitIndex, 1);
            (0, json_manager_1.saveUserDataToJson)(userName, userData);
            res.send({ message: "Udało się usunąć nawyk" });
        };
        this.addActivity = async (req, res) => {
            const { id, date } = req.body;
            const { userName } = req.user;
            const userData = userName == "kuba" ? this.kubaData : this.juliaData;
            const habit = this.findHabitByID(id, userData.habits);
            const index = this.findRightIndexByDate(date, habit.activities);
            habit.activities.splice(index, 0, date);
            (0, json_manager_1.saveUserDataToJson)(userName, userData);
            res.send({ message: "Udało się dodać aktywność" });
        };
        this.deleteActivity = async (req, res) => {
            const { id, date } = req.body;
            const { userName } = req.user;
            const userData = userName == "kuba" ? this.kubaData : this.juliaData;
            const habit = this.findHabitByID(id, userData.habits);
            const index = this.findRightIndexByDate(date, habit.activities);
            habit.activities.splice(index, 1);
            (0, json_manager_1.saveUserDataToJson)(userName, userData);
            res.send({ message: "Udało się usunąć aktywność" });
        };
        this.findHabitByID = (id, habits) => {
            return habits.find((habit) => habit.id === id);
        };
        this.findRightIndexByDate = (newDateString, activities) => {
            let newDate = new Date(newDateString);
            let low = 0, high = activities.length;
            while (low < high) {
                let mid = (low + high) >>> 1;
                if (new Date(activities[mid]) < newDate)
                    low = mid + 1;
                else
                    high = mid;
            }
            return low;
        };
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`/data`, authentication_1.default, (0, catch_error_1.default)(this.getUserData));
        this.router.post(`/habit/create`, authentication_1.default, (0, validate_1.default)(create_habit_schema_1.default), (0, catch_error_1.default)(this.createHabit));
        this.router.post("/habit/edit_name", authentication_1.default, (0, validate_1.default)(edit_habit_name_schema_1.default), (0, catch_error_1.default)(this.editHabitName));
        this.router.post("/habit/edit_order", authentication_1.default, (0, validate_1.default)(edit_habits_order_schema_1.default), (0, catch_error_1.default)(this.editHabitsOrder));
        this.router.post("/habit/delete", authentication_1.default, (0, validate_1.default)(delete_habit_schema_1.default), (0, catch_error_1.default)(this.deleteHabit));
        this.router.post("/habit/activity/add", authentication_1.default, (0, validate_1.default)(add_activity_schema_1.default), (0, catch_error_1.default)(this.addActivity));
        this.router.post("/habit/activity/delete", authentication_1.default, (0, validate_1.default)(add_activity_schema_1.default), (0, catch_error_1.default)(this.deleteActivity));
    }
}
exports.default = HabitController;
