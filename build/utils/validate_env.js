"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const envalid_1 = require("envalid");
function validateEnv() {
    (0, envalid_1.cleanEnv)(process.env, {
        // server running port
        PORT: (0, envalid_1.port)(),
        // CORS Options
        DEV_WHITELISTED_DOMAINS: (0, envalid_1.str)(),
        PRO_WHITELISTED_DOMAINS: (0, envalid_1.str)(),
        // Authentication configuration
        JWT_SECRET: (0, envalid_1.str)(),
        TOKEN_EXPIRE_AFTER: (0, envalid_1.num)(),
    });
}
exports.default = validateEnv;
