"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
const wrong_authentication_token_1 = __importDefault(require("./exceptions/wrong_authentication_token"));
const { JWT_SECRET } = process.env;
function authMiddleware(request, response, next) {
    const bearerHeader = request.headers["authorization"];
    if (bearerHeader) {
        const bearer = bearerHeader.substring(7);
        try {
            (0, jsonwebtoken_1.verify)(bearer, JWT_SECRET, async function (err, decoded) {
                if (err) {
                    next(new wrong_authentication_token_1.default());
                }
                else {
                    request.user = decoded;
                    return next();
                }
            });
        }
        catch (error) {
            next(new wrong_authentication_token_1.default());
        }
    }
    else {
        next(new wrong_authentication_token_1.default());
    }
}
exports.default = authMiddleware;
