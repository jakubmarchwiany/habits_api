import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import WrongAuthenticationTokenException from "./exceptions/wrong_authentication_token";

const { JWT_SECRET } = process.env;

function authMiddleware(request: Request, response: Response, next: NextFunction) {
    const bearerHeader = request.headers["authorization"];
    console.log(bearerHeader);
    if (bearerHeader) {
        const bearer = bearerHeader.substring(7);
        try {
            verify(bearer, JWT_SECRET!, async function (err, decoded) {
                if (err) {
                    next(new WrongAuthenticationTokenException());
                } else {
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
