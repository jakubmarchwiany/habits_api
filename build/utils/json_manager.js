"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveUserDataToJson = exports.getUserDataFromJson = exports.getUsersFromJson = void 0;
const jsonfile_1 = require("jsonfile");
const path_1 = __importDefault(require("path"));
const getUsersFromJson = () => {
    const data = (0, jsonfile_1.readFileSync)(path_1.default.join(__dirname + "../../data/users.json"), "utf8");
    return data;
};
exports.getUsersFromJson = getUsersFromJson;
const getUserDataFromJson = (userName) => {
    const data = (0, jsonfile_1.readFileSync)(path_1.default.join(__dirname + "../../data/") + `${userName}.json`, "utf8");
    return data;
};
exports.getUserDataFromJson = getUserDataFromJson;
const saveUserDataToJson = (userName, userData) => {
    userData.version++;
    (0, jsonfile_1.writeFileSync)(path_1.default.join(__dirname + "../../data/") + `${userName}.json`, userData);
};
exports.saveUserDataToJson = saveUserDataToJson;
