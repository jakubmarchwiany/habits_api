import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

import { DataStoredInToken } from "../models/user/data_stored_in_token.type";
import { ENV } from "../utils/validate_env";
import { AuthenticationTokenMissingException } from "./exceptions/authentication_token_missing.exception";
import { WrongAuthenticationTokenException } from "./exceptions/wrong_authentication_token.exception";

const { JWT_SECRET } = ENV;

export type AuthRequest<P, ResBody, ReqBody, ReqQuery> = Request<P, ResBody, ReqBody, ReqQuery> & {
	user: DataStoredInToken;
};

export type MyResponse<T> = Response<{ data?: T; message: string }>;

// export interface AuthRequest<
// 	P,
// 	ResBody,
// 	ReqBody,
// 	ReqQuery,
// 	Locals extends Record<string, any>> extends  Request<
//         P,
//         ResBody,
//         ReqBody,
//         ReqQuery,
//         Locals>

export function authMiddleware(
	request: Request & { user?: DataStoredInToken },
	response: Response,
	next: NextFunction
): void {
	const bearerHeader = request.headers.authorization;

	if (bearerHeader) {
		const bearer = bearerHeader.substring(7);

		try {
			verify(bearer, JWT_SECRET, (err, decoded) => {
				if (err) {
					next(new WrongAuthenticationTokenException());
				} else {
					request.user = decoded as DataStoredInToken;

					next();
				}
			});
		} catch (error) {
			next(new WrongAuthenticationTokenException());
		}
	} else {
		next(new AuthenticationTokenMissingException());
	}
}
