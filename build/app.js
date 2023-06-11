"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_controller_1 = __importDefault(require("./controllers/auth_controller"));
const habit_controller_1 = __importDefault(require("./controllers/habit_controller"));
const server_1 = __importDefault(require("./server"));
const validate_env_1 = __importDefault(require("./utils/validate_env"));
(0, validate_env_1.default)();
const app = new server_1.default([new auth_controller_1.default(), new habit_controller_1.default()]);
app.listen();
