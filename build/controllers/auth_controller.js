"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const catch_error_1 = __importDefault(require("../middleware/catch_error"));
const wrong_credentials_exception_1 = __importDefault(require("../middleware/exceptions/wrong-credentials-exception"));
const login_user_schema_1 = __importDefault(require("../middleware/schemas/auth/login_user_schema"));
const validate_1 = __importDefault(require("../middleware/validate"));
const json_manager_1 = require("../utils/json_manager");
const { JWT_SECRET, TOKEN_EXPIRE_AFTER } = process.env;
class AuthenticationController {
    constructor() {
        this.router = (0, express_1.Router)();
        this.path = "/auth";
        this.users = (0, json_manager_1.getUsersFromJson)();
        this.loggingIn = async (req, res, next) => {
            const { username, password } = req.body;
            for (const element of this.users) {
                if (element.username == username) {
                    if (element.password == password) {
                        const expiresIn = parseInt(TOKEN_EXPIRE_AFTER);
                        const dataStoredInToken = {
                            userName: username,
                        };
                        const tokenData = jsonwebtoken_1.default.sign(dataStoredInToken, JWT_SECRET, { expiresIn });
                        res.send({
                            token: tokenData,
                            message: "Udało się zalogować",
                        });
                        return;
                    }
                    else {
                        throw new wrong_credentials_exception_1.default();
                    }
                }
            }
            throw new wrong_credentials_exception_1.default();
        };
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post(`/login`, (0, validate_1.default)(login_user_schema_1.default), (0, catch_error_1.default)(this.loggingIn));
    }
}
exports.default = AuthenticationController;
