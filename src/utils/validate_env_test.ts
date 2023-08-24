const { cleanEnv, num, port, str } = require("envalid");

export function validateEnvTest() {
    cleanEnv(process.env, {
        // environment
        NODE_ENV: str({ choices: ["test"] }),
        API_URL: str(),

        // login data
        USERNAME_CORRECT: str(),
        PASSWORD_CORRECT: str(),
    });
}
