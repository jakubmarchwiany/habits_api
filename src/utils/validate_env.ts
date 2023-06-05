import { cleanEnv, num, port, str } from "envalid";

function validateEnv() {
    cleanEnv(process.env, {
        // server running port
        PORT: port(),

        // CORS Options
        DEV_WHITELISTED_DOMAINS: str(),
        PRO_WHITELISTED_DOMAINS: str(),

        // Authentication configuration
        JWT_SECRET: str(),
        TOKEN_EXPIRE_AFTER: num(),
    });
}
export default validateEnv;
