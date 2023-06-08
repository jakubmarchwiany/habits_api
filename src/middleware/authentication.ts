import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import WrongAuthenticationTokenException from "./exceptions/wrong_authentication_token";
import { DataStoredInToken } from "../models/data_stored_in_token";

const { JWT_SECRET } = process.env;

export type ReqUser = { user: DataStoredInToken };

function authMiddleware(
    request: Request & { user?: DataStoredInToken },
    response: Response,
    next: NextFunction
) {
    const bearerHeader = request.headers["authorization"];
    if (bearerHeader) {
        const bearer = bearerHeader.substring(7);
        try {
            verify(bearer, JWT_SECRET!, async function (err, decoded) {
                if (err) {
                    next(new WrongAuthenticationTokenException());
                } else {
                    request.user = decoded as DataStoredInToken;
                    return next();
                }
            });
        } catch (error) {
            next(new WrongAuthenticationTokenException());
        }
    } else {
        next(new WrongAuthenticationTokenException());
    }
}
export default authMiddleware;
