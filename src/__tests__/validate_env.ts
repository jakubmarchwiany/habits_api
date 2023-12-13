import { cleanEnv, num, str } from "envalid";

export const ENV_TESTS = cleanEnv(process.env, {
	API_URL: str(),

	DAYS_FROM_TODAY: num(),
	MONGO_URL: str(),

	NODE_ENV: str({ choices: ["test"] }),
	PASSWORD_CORRECT: str(),

	TEST_HABIT: str(),

	USERNAME_CORRECT: str()
});
