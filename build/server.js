"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = require("body-parser");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const error_1 = __importDefault(require("./middleware/error"));
const http_1 = __importDefault(require("./middleware/exceptions/http"));
const { WHITELISTED_DOMAINS } = process.env;
const WHITELIST = WHITELISTED_DOMAINS ? WHITELISTED_DOMAINS.split(",") : [];
function sleepMiddleware(delay) {
    return function (req, res, next) {
        setTimeout(next, delay);
    };
}
class Server {
    constructor(controllers) {
        this.app = (0, express_1.default)();
        this.initializeCors();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.initializeErrorHandling();
    }
    initializeMiddlewares() {
        // this.app.use(sleepMiddleware(0));
        this.app.use((0, body_parser_1.json)({ limit: "50mb" }));
        this.app.use((0, body_parser_1.urlencoded)({ limit: "50mb", extended: true }));
        this.app.use((0, cookie_parser_1.default)());
    }
    initializeCors() {
        const corsOptions = {
            origin: function (origin, callback) {
                if (WHITELIST.indexOf(origin) !== -1 || !origin) {
                    callback(null, true);
                }
                else {
                    callback(new Error("Not allowed by CORS"));
                }
            },
            credentials: true,
        };
        this.app.use((0, cors_1.default)(corsOptions));
    }
    initializeControllers(controllers) {
        controllers.forEach((controller) => {
            this.app.use("/bobciowo" + controller.path, controller.router);
        });
        this.app.use("*", (req, res, next) => {
            next(new http_1.default(404, "Not found"));
        });
    }
    initializeErrorHandling() {
        this.app.use(error_1.default);
    }
    listen() {
        this.app.listen(process.env.PORT || 8080, () => {
            console.log(`Server listening on the port ${process.env.PORT || 8080}`);
        });
    }
}
exports.default = Server;
