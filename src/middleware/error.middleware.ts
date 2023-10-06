import { NextFunction, Request, Response } from "express";

import { HttpException } from "./exceptions/http.exception";

export function errorMiddleware(
	error: HttpException,
	_request: Request,
	response: Response,
	_next: NextFunction
): void {
	const status = error.status || 500;
	const message = error.message || "Coś poszło nie tak";

	response.status(status).send({
		message,
		status
	});
}
