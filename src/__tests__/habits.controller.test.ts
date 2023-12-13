import { beforeAll, describe, expect, it } from "bun:test";
import { Chance } from "chance";
import { Response } from "supertest";

import { authGetRequest, authPostRequest, getUserToken } from "./useful";
import { ENV_TESTS } from "./validate_env";

const { DAYS_FROM_TODAY, TEST_HABIT } = ENV_TESTS;
const chance = Chance();

describe("Habits controller", () => {
	let token: string;
	let res: Response;

	let createdHabitId: string;

	beforeAll(async () => {
		token = await getUserToken();
	});

	describe("/habits", () => {
		describe("/", () => {
			it("should_return_200_for_valid_data", async () => {
				const pastDate = new Date();

				pastDate.setDate(new Date().getDate() - DAYS_FROM_TODAY);

				res = await authGetRequest("/habits", token)
					.query({
						dateFrom: pastDate,
						myHabits: true
					})
					.query({ dateFrom: pastDate, myHabits: true });

				expect(res.statusCode).toBe(200);

				const { groupsOfHabits, habits } = res.body.data;

				expect(habits).toBeArray();

				expect(groupsOfHabits).toBeArray();

				for (const habit of habits) {
					const { _id, activities, description, periodInDays } = habit;

					expect(_id).toBeString();

					expect(description).toBeString();

					expect(periodInDays).toBeNumber();

					expect(activities).toBeArray();

					for (const activity of habit.activities) {
						const { _id, date } = activity;

						expect(_id).toBeString();

						expect(date).toBeString();
					}
				}

				for (const group of groupsOfHabits) {
					const { _id, habitsIds, name } = group;

					expect(_id).toBeString();

					expect(name).toBeString();

					expect(habitsIds).toBeArray();

					for (const id of group.habitsIds) {
						expect(id).toBeString();
					}
				}
			});

			it("should_return_400_for_future_date", async () => {
				const futureData = new Date();

				futureData.setDate(new Date().getDate() + DAYS_FROM_TODAY);

				res = await authGetRequest("/habits", token).query({
					dateFrom: futureData,
					myHabits: true
				});

				expect(res.statusCode).toBe(400);
			});

			it("should_return_400_for_missing_dateFrom", async () => {
				res = await authGetRequest("/habits", token)
					.query({
						myHabits: true
					})
					.query({ myHabits: true });

				expect(res.statusCode).toBe(400);
			});

			it("should_return_400_for_missing_myHabits", async () => {
				const pastDate = new Date();

				pastDate.setDate(new Date().getDate() - DAYS_FROM_TODAY);

				res = await authGetRequest("/habits", token).query({
					dateFrom: pastDate
				});

				expect(res.statusCode).toBe(400);
			});
		});

		describe("/-", () => {
			describe("/create", () => {
				it("should_return_200_for_valid_data", async () => {
					const newHabits = {
						description: chance.string(),
						name: chance.string(),
						periodInDays: chance.natural({ max: 31, min: 1 })
					};

					res = await authPostRequest("/habits/-/create", token).send(newHabits);

					expect(res.statusCode).toBe(200);

					const { habitId } = res.body.data;

					expect(habitId).toBeString();

					createdHabitId = habitId;
				});

				it("should_return_400_for_invalid_data", async () => {
					const newHabits = {
						description: chance.string(),
						periodInDays: chance.natural({ max: 31, min: 1 }),
						wrongField: chance.string()
					};

					res = await authPostRequest("/habits/-/create", token).send(newHabits);

					expect(res.statusCode).toBe(400);
				});

				it("should_return_400_for_missing_name", async () => {
					const newHabits = {
						description: chance.string(),
						periodInDays: chance.natural({ max: 31, min: 1 })
					};

					res = await authPostRequest("/habits/-/create", token).send(newHabits);

					expect(res.statusCode).toBe(400);
				});

				it("should_return_400_for_missing_periodInDays", async () => {
					const newHabits = {
						description: chance.string(),
						name: chance.string()
					};

					res = await authPostRequest("/habits/-/create", token).send(newHabits);

					expect(res.statusCode).toBe(400);
				});
			});
		});

		describe("/:habitId", () => {
			describe("/update", () => {
				it("should_return_200_for_valid_data", async () => {
					const updatedHabit = {
						newDescription: chance.string(),
						newName: chance.string(),
						newPeriodInDays: chance.natural({ max: 31, min: 1 })
					};

					res = await authPostRequest(`/habits/${createdHabitId}/update`, token).send(
						updatedHabit
					);

					expect(res.statusCode).toBe(200);
				});

				it("should_return_400_for_invalid_data", async () => {
					const updatedHabit = {
						newName: chance.string()
					};

					res = await authPostRequest(
						"/habits/64e1ec8115d01e5e7ecb21ff/update",
						token
					).send(updatedHabit);

					expect(res.statusCode).toBe(400);
				});

				it("should_return_400_for_missing_newName", async () => {
					const updatedHabit = {
						newDescription: chance.string(),
						newPeriodInDays: chance.natural({ max: 31, min: 1 })
					};

					res = await authPostRequest(
						"/habits/64e1ec8115d01e5e7ecb21ff/update",
						token
					).send(updatedHabit);

					expect(res.statusCode).toBe(400);
				});

				it("should_return_400_for_missing_newPeriodInDays", async () => {
					const updatedHabit = {
						newName: chance.string()
					};

					res = await authPostRequest(
						"/habits/64e1ec8115d01e5e7ecb21ff/update",
						token
					).send(updatedHabit);

					expect(res.statusCode).toBe(400);
				});
			});

			describe("/delete", () => {
				it("should_return_200_for_valid_id", async () => {
					res = await authPostRequest(`/habits/${createdHabitId}/delete`, token);

					expect(res.statusCode).toBe(200);
				});

				it("should_return_400_for_invalid_id", async () => {
					res = await authPostRequest("/habits/invalidId/delete", token);

					expect(res.statusCode).toBe(400);
				});
			});

			describe("/activities", () => {
				it("should_return_200_for_valid_data", async () => {
					const pastDate = new Date();

					pastDate.setDate(new Date().getDate() - DAYS_FROM_TODAY);

					res = await authGetRequest(`/habits/${TEST_HABIT}/activities`, token).query({
						dateFrom: pastDate
					});

					expect(res.statusCode).toBe(200);

					const { activities } = res.body.data;

					expect(activities).toBeArray();

					for (const activity of activities) {
						const { _id, date } = activity;

						expect(_id).toBeString();

						expect(date).toBeString();
					}
				});

				it("should_return_400_for_future_date", async () => {
					const futureDate = new Date();

					futureDate.setDate(new Date().getDate() + DAYS_FROM_TODAY);

					res = await authGetRequest(`/habits/${TEST_HABIT}/activities`, token).query({
						dateFrom: futureDate
					});

					expect(res.statusCode).toBe(400);
				});

				it("should_return_400_for_missing_dateFrom", async () => {
					res = await authGetRequest(`/habits/${TEST_HABIT}/activities`, token);

					expect(res.statusCode).toBe(400);
				});
			});
		});

		describe("/groupsOfHabits", () => {
			describe("/update", () => {
				it("should_return_200_for_valid_data", async () => {
					const newGroupsOfHabits = [
						{
							_id: "1119c387193a1188daa2a113",
							habitsIds: [
								"1219c387193a1188daa2a113",
								"1229c387193a1188daa2a113",
								"1239c387193a1188daa2a113"
							],
							name: "test"
						}
					];

					res = await authPostRequest("/habits/groupsOfHabits/update", token).send({
						newGroupsOfHabits
					});

					expect(res.statusCode).toBe(200);
				});

				it("should_return_400_for_invalid_data", async () => {
					const newGroupsOfHabits = [
						{
							_id: "1119c387193a1188daa2a113",
							habitsIds: [
								"1119c387193a1188daa2a113",
								"1129c387193a1188daa2a113",
								"1139c387193a1188daa2a113"
							],
							name_wrong_field: "test"
						}
					];

					res = await authPostRequest("/habits/groupsOfHabits/update", token).send({
						newGroupsOfHabits
					});

					expect(res.statusCode).toBe(400);
				});

				it("should_return_400_for_missing_newGroupsOfHabits", async () => {
					res = await authPostRequest("/habits/groupsOfHabits/update", token);

					expect(res.statusCode).toBe(400);
				});
			});
		});
	});
});
