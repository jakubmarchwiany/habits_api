import { cleanEnv, num, str } from "envalid";

export const ENV_TESTS = cleanEnv(process.env, {
	NODE_ENV: str({ choices: ["test"] }),

	API_URL: str(),
	MONGO_URL: str(),

	USERNAME_CORRECT: str(),
	PASSWORD_CORRECT: str(),

	DAYS_FROM_TODAY: num(),

	TEST_HABIT: str()
});
