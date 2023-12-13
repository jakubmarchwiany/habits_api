import { cleanEnv, num, port, str } from "envalid";

export const ENV = cleanEnv(process.env, {
	// server running port
	API_PREFIX: str(),

	// authentication configuration
	JWT_SECRET: str(),

	// database configuration
	MONGO_URL: str(),

	// environment
	NODE_ENV: str({ choices: ["development", "production", "test"] }),

	PORT: port(),

	TOKEN_EXPIRE_AFTER: str(),

	// cors Options
	WHITELISTED_DOMAINS: str()
});
