/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Response } from "supertest";

export const myAfterEach = (res: Response): void => {
	const expectState = expect.getState();

	if (expectState.assertionCalls !== expectState.numPassingAsserts) {
		printBody(res);
	}
};

export function printBody(res: Response): void {
	console.log(
		"\x1b[31m ######################################### \x1b[0m\n",
		res.body,
		"\n\x1b[31m ######################################### \x1b[0m"
	);
}

export function expectedBody(p: any): any {
	return { data: { ...p }, message: expect.any(String) };
}
