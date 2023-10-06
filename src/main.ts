import { AuthenticationController } from "./controllers/auth/auth.controller";
import { ActivityController } from "./controllers/habits/activities.controller";
import { HabitsController } from "./controllers/habits/habits.controller";
import Server from "./server";

const app = new Server([
	new AuthenticationController(),
	new ActivityController(),
	new HabitsController()
]);

app.listen();
