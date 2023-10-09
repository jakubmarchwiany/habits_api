import * as dotenv from "dotenv";
import * as request from "supertest";

import { expectedBody, myAfterEach } from "./useful";
dotenv.config({ path: ".env.test" });

const { API_URL, PASSWORD_CORRECT, USERNAME_CORRECT } = process.env;

describe("Auth controller", () => {
	let res: request.Response;

	afterEach(() => {
		myAfterEach(res);
	});

	describe("/auth/login", () => {
		it("should_return_200_for_valid_credentials", async () => {
			res = await request(API_URL).post("/auth/login").send({
				username: USERNAME_CORRECT,
				password: PASSWORD_CORRECT
			});

			expect(res.statusCode).toBe(200);

			expect(res.body).toEqual(expectedBody({ token: expect.any(String) }));
		});

		it("should_return_400_for_invalid_credentials", async () => {
			res = await request(API_URL).post("/auth/login").send({
				username: "wrong",
				password: "wrong"
			});

			expect(res.statusCode).toBe(400);
		});

		it("should_return_400_for_missing_username", async () => {
			res = await request(API_URL).post("/auth/login").send({
				password: "wrong"
			});

			expect(res.statusCode).toBe(400);
		});

		it("should_return_400_for_missing_password", async () => {
			res = await request(API_URL).post("/auth/login").send({
				username: "wrong"
			});

			expect(res.statusCode).toBe(400);
		});
	});
});
