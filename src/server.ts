import { json, urlencoded } from "body-parser";
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import express from "express";
import mongoose, { ConnectOptions } from "mongoose";
import Controller from "./interfaces/controller_interface";
import errorMiddleware from "./middleware/error";
import HttpException from "./middleware/exceptions/http";
import { mongoHelper } from "./utils/mongoHelper";

const { WHITELISTED_DOMAINS, MONGO_URL } = process.env;

const WHITELIST = WHITELISTED_DOMAINS ? WHITELISTED_DOMAINS.split(",") : [];

function sleepMiddleware(delay: any) {
    return function (req: any, res: any, next: any) {
        setTimeout(next, delay);
    };
}

class Server {
    public app: express.Application;

    constructor(controllers: Controller[]) {
        this.app = express();
        this.connectToTheDatabase();
        this.initializeCors();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.initializeErrorHandling();
    }

    private connectToTheDatabase() {
        const options: ConnectOptions = {
            serverSelectionTimeoutMS: 1000
            // Timeout after 5s instead of 30s
        };
        mongoose.set("strictQuery", true);
        mongoose
            .connect(MONGO_URL, options)
            .then(() => {
                console.log("Connected to the database");
                mongoHelper();
            })
            .catch((e) => {
                console.log(e.reason);
                console.log("Error connecting to the database");
            });
    }

    private initializeMiddlewares() {
        // this.app.use(sleepMiddleware(0));
        this.app.use(json({ limit: "50mb" }));
        this.app.use(urlencoded({ limit: "50mb", extended: true }));
        this.app.use(cookieParser());
    }

    private initializeCors() {
        const corsOptions: CorsOptions = {
            origin: function (origin, callback) {
                if (WHITELIST.indexOf(origin!) !== -1 || !origin) {
                    callback(null, true);
                } else {
                    callback(new Error("Not allowed by CORS"));
                }
            },
            credentials: true
        };
        this.app.use(cors(corsOptions));
    }

    private initializeControllers(controllers: Controller[]) {
        controllers.forEach((controller) => {
            this.app.use("/bobciowo" + controller.path, controller.router);
        });
        this.app.use("*", (req, res, next) => {
            next(new HttpException(404, "Not found"));
        });
    }

    private initializeErrorHandling() {
        this.app.use(errorMiddleware);
    }

    public listen() {
        this.app.listen(process.env.PORT || 8080, () => {
            console.log(`Server listening on the port ${process.env.PORT || 8080}`);
        });
    }
}
export default Server;
