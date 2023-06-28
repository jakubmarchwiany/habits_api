import { NextFunction, Request, Response } from "express";
import HttpException from "./exceptions/http";

const { NODE_ENV } = process.env;

function errorMiddleware(
    error: HttpException,
    request: Request,
    response: Response,
    next: NextFunction
) {
    const status = error.status || 500;
    let message;
    if (NODE_ENV === "development") {
        message = error.message;
    } else {
        message = "Coś poszło nie tak";
    }

    response.status(status).send({
        message,
        status,
    });
}
export default errorMiddleware;
