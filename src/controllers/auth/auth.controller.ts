import { Request, Router } from "express";
import { sign } from "jsonwebtoken";

import { MyResponse } from "../../middleware/auth.middleware";
import { WrongCredentialsException } from "../../middleware/exceptions/wrong_credentials.exception";
import { LoginData, loginSchema } from "../../middleware/schemas/auth/login.schema";
import { validate } from "../../middleware/validate.middleware";
import { DataStoredInToken } from "../../models/user/data_stored_in_token.type";
import { UserModel } from "../../models/user/user";
import { catchError } from "../../utils/catch_error";
import { ENV } from "../../utils/validate_env";
import { Controller } from "../controller.type";

const { JWT_SECRET, TOKEN_EXPIRE_AFTER } = ENV;

export class AuthenticationController implements Controller {
	public path = "/auth";
	public router = Router();

	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		this.router.post(`/login`, validate(loginSchema), catchError(this.loggingIn));
	}

	private loggingIn = async (
		req: Request<undefined, undefined, LoginData["body"]>,
		res: MyResponse<{ token: string }>
	): Promise<void> => {
		const { password, username } = req.body;

		const user = await UserModel.findOne(
			{ username },
			{ dearId: 1, password: 1, username: 1 }
		).lean();

		if (user !== null) {
			const passwordCorrect = await Bun.password.verify(password, user.password);

			if (passwordCorrect) {
				const dataStoredInToken: DataStoredInToken = {
					dearId: user.dearId,
					userId: user._id
				};

				const token = sign(dataStoredInToken, JWT_SECRET, {
					expiresIn: TOKEN_EXPIRE_AFTER
				});

				res.send({
					data: { token },
					message: "Udało się zalogować"
				});
			} else {
				throw new WrongCredentialsException();
			}
		} else {
			throw new WrongCredentialsException();
		}
	};
}
