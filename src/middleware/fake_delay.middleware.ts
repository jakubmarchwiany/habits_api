import { NextFunction, Request, Response } from "express";

import { sleep } from "../utils/sleep";

export async function fakeDelayMiddleware(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	await sleep(0);

	next();
}
