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
const add_habit_schema_1 = __importDefault(require("../middleware/schemas/habit/add_habit_schema"));
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
            const userData = userName == "kuba" ? this.kubaData : this.juliaData;
            const data = structuredClone(userData);
            data.habits.forEach((habit) => {
                return habit.activities.length > 60 && habit.activities.splice(-30);
            });
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
        this.router.post(`/habit/create`, authentication_1.default, (0, validate_1.default)(add_habit_schema_1.default), (0, catch_error_1.default)(this.createHabit));
        this.router.post("/habit/activity/add", authentication_1.default, (0, validate_1.default)(add_activity_schema_1.default), (0, catch_error_1.default)(this.addActivity));
        this.router.post("/habit/activity/delete", authentication_1.default, (0, validate_1.default)(add_activity_schema_1.default), (0, catch_error_1.default)(this.deleteActivity));
    }
}
exports.default = HabitController;
