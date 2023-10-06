/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NextFunction, Request, Response } from "express";
import { Schema } from "yup";

import { HttpException } from "./exceptions/http.exception";

export function validate(schema: Schema) {
	return (req: Request, res: Response, next: NextFunction): void => {
		schema
			.validate({
				body: req.body,
				params: req.params,
				query: req.query
			})
			.then(() => {
				next();
			})
			.catch((error: Error) => {
				next(new HttpException(400, error.message));
			});
	};
}
