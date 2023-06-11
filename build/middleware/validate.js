"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("./exceptions/http"));
function validate(schema) {
    return (req, res, next) => {
        schema
            .validate({
            body: req.body,
            query: req.query,
            params: req.params,
        })
            .then(() => {
            next();
        })
            .catch((error) => {
            next(new http_1.default(400, error.message));
        });
    };
}
exports.default = validate;
