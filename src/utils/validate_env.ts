import { cleanEnv, num, port, str } from "envalid";

function validateEnv() {
    cleanEnv(process.env, {
        // environment
        NODE_ENV: str({ choices: ["development", "production","test"] }),

        // server running port
        PORT: port(),

        // cors Options
        WHITELISTED_DOMAINS: str(),

        // authentication configuration
        JWT_SECRET: str(),
        TOKEN_EXPIRE_AFTER: num(),

        // database configuration
        MONGO_URL: str(),
    });
}

export default validateEnv;
