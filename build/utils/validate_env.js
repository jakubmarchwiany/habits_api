"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const envalid_1 = require("envalid");
function validateEnv() {
    (0, envalid_1.cleanEnv)(process.env, {
        // environment
        NODE_ENV: (0, envalid_1.str)({ choices: ["development", "production"] }),
        // server running port
        PORT: (0, envalid_1.port)(),
        // cors Options
        WHITELISTED_DOMAINS: (0, envalid_1.str)(),
        // authentication configuration
        JWT_SECRET: (0, envalid_1.str)(),
        TOKEN_EXPIRE_AFTER: (0, envalid_1.num)(),
    });
}
exports.default = validateEnv;
