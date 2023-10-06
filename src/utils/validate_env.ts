import { cleanEnv, num, port, str } from "envalid";

export const ENV = cleanEnv(process.env, {
	// environment
	NODE_ENV: str({ choices: ["development", "production", "test"] }),

	// server running port
	API_PREFIX: str(),
	PORT: port(),

	// cors Options
	WHITELISTED_DOMAINS: str(),

	// authentication configuration
	JWT_SECRET: str(),
	TOKEN_EXPIRE_AFTER: str(),

	// database configuration
	MONGO_URL: str()
});
