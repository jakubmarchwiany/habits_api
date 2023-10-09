/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as request from "supertest";

const { API_URL } = process.env;

export const authGetRequest = (url: string, token: string): request.Request => {
	return request(API_URL)
		.get(url)
		.set("Authorization", `Bearer ${token}`)
		.set("Accept-Encoding", "");
};

export const authPostRequest = (url: string, token: string): request.Request => {
	return request(API_URL)
		.post(url)
		.set("Authorization", `Bearer ${token}`)
		.set("Accept-Encoding", "");
};

export const myAfterEach = (res: request.Response): void => {
	const expectState = expect.getState();

	if (expectState.assertionCalls !== expectState.numPassingAsserts) {
		printBody(res);
	}
};

export function printBody(res: request.Response): void {
	console.log(
		"\x1b[31m ######################################### \x1b[0m\n",
		res.body,
		"\n\x1b[31m ######################################### \x1b[0m"
	);
}

export function expectedBody(p: any): any {
	return { data: { ...p }, message: expect.any(String) };
}
