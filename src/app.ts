import "dotenv/config";
import AuthenticationController from "./controllers/auth_controller";
import Server from "./server";
import validateEnv from "./utils/validate_env";
import HabitController from "./controllers/habit_controller";

validateEnv();

const app = new Server([new AuthenticationController(), new HabitController()]);

app.listen();
