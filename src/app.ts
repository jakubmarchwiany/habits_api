import { log } from "console";
import AuthenticationController from "./controllers/auth_controller";
import HabitController from "./controllers/habit_controller";
import Server from "./server";
import validateEnv from "./utils/validate_env";
const time = new Date()
time.setHours(0,0,0,0);
console.log("######################");
console.log(time.toLocaleString());
console.log(time.getTimezoneOffset());
console.log("######################");

validateEnv();

const app = new Server([new AuthenticationController(), new HabitController()]);

app.listen();
