import { beforeAll, describe, expect, it } from "bun:test";
import { Response } from "supertest";

import { authPostRequest, getUserToken } from "./useful";
import { ENV_TESTS } from "./validate_env";

const { TEST_HABIT } = ENV_TESTS;

describe("Habits controller", () => {
	let token: string;
	let res: Response;
	let createActivityId: string;

	beforeAll(async () => {
		token = await getUserToken();
	});

	describe("/habits/-/activities", () => {
		describe("/-", () => {
			describe("/create", () => {
				it("should_return_200_for_valid_data", async () => {
					const newActivity = { habitId: TEST_HABIT, date: new Date() };

					res = await authPostRequest(`/habits/-/activities/-/create`, token).send(
						newActivity
					);

					console.log("res.body :>> ", res.body);

					expect(res.statusCode).toBe(200);

					const { activityId } = res.body.data;

					createActivityId = activityId;
				});

				it("should_return_400_for_same_date_activity", async () => {
					const newActivity = { habitId: TEST_HABIT, date: new Date() };

					res = await authPostRequest(`/habits/-/activities/-/create`, token).send(
						newActivity
					);

					expect(res.statusCode).toBe(400);
				});

				it("should_return_400_for_invalid_data", async () => {
					const newActivity = { habitId: TEST_HABIT, wrongField: new Date() };

					res = await authPostRequest(`/habits/-/activities/-/create`, token).send(
						newActivity
					);

					expect(res.statusCode).toBe(400);
				});

				it("should_return_400_for_missing_habitId", async () => {
					const newActivity = { date: new Date() };

					res = await authPostRequest(`/habits/-/activities/-/create`, token).send(
						newActivity
					);

					expect(res.statusCode).toBe(400);
				});

				it("should_return_400_for_missing_date", async () => {
					const newActivity = { habitId: TEST_HABIT };

					res = await authPostRequest(`/habits/-/activities/-/create`, token).send(
						newActivity
					);

					expect(res.statusCode).toBe(400);
				});
			});
		});

		describe(":activityId", () => {
			describe("/delete", () => {
				it("should_return_200_for_valid_data", async () => {
					res = await authPostRequest(
						`/habits/-/activities/${createActivityId}/delete`,
						token
					);

					expect(res.statusCode).toBe(200);
				});

				it("should_return_400_for_invalid_data", async () => {
					res = await authPostRequest("/habits/-/activities/wrongId/delete", token);

					expect(res.statusCode).toBe(400);
				});
			});
		});
	});
});
