/* eslint-disable @typescript-eslint/ban-types */

import { NextFunction, Request, Response } from "express";

export const catchError =
	(func: Function) =>
	(req: Request, res: Response, next: NextFunction): void => {
		Promise.resolve(func(req, res, next)).catch((error: Error) => {
			console.log(error);

			next(error);
		});
	};

// export const catchAsyncError = (func: Function) => {
// 	return (req: Request, res: Response, next: NextFunction): void => {
// 		try {
// 			func(req, res, next);
// 		} catch (error) {
// 			console.log(error);

// 			next(error);
// 		}
// 	};
// };
