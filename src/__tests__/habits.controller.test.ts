import { beforeAll, describe, expect, it } from "bun:test";
import { Chance } from "chance";
import request, { Response } from "supertest";

import { authGetRequest, authPostRequest, expectedBody } from "./useful";
import { ENV_TESTS } from "./validate_env";

const { API_URL, PASSWORD_CORRECT, USERNAME_CORRECT, DAYS_FROM_TODAY } = ENV_TESTS;
const chance = Chance();

describe("Habits controller", () => {
	let token: string;
	let res: Response;

	beforeAll(async () => {
		const res = await request(API_URL).post("/auth/login").send({
			password: PASSWORD_CORRECT,
			username: USERNAME_CORRECT
		});

		token = res.body.data.token;
	});

	describe("/habits", () => {
		it("should_return_200_for_valid_dateFrom_myHabits", async () => {
			const pastDate = new Date();

			pastDate.setDate(new Date().getDate() - DAYS_FROM_TODAY);

			res = await authGetRequest(`/habits`, token)
				.query({
					dateFrom: pastDate,
					myHabits: true
				})
				.query({ dateFrom: pastDate, myHabits: true });

			expect(res.statusCode).toBe(200);

			const { habits, groupsOfHabits } = res.body.data;

			expect(habits).toBeArray();

			expect(groupsOfHabits).toBeArray();

			for (const habit of habits) {
				const { _id, description, periodInDays, activities } = habit;

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
				const { _id, name, habitsIds } = group;

				expect(_id).toBeString();

				expect(name).toBeString();

				expect(habitsIds).toBeArray();

				for (const id of group.habitsIds) {
					expect(id).toBeString();
				}
			}
		});

		it("should_return_400_for_future_date", async () => {
			const pastDate = new Date();

			pastDate.setDate(new Date().getDate() + DAYS_FROM_TODAY);

			res = await authGetRequest(`/habits`, token).query({
				dateFrom: pastDate,
				myHabits: true
			});

			expect(res.statusCode).toBe(400);
		});

		it("should_return_400_for_missing_dateFrom", async () => {
			res = await authGetRequest(`/habits`, token)
				.query({
					myHabits: true
				})
				.query({ myHabits: true });

			expect(res.statusCode).toBe(400);
		});

		it("should_return_400_for_missing_myHabits", async () => {
			const pastDate = new Date();

			pastDate.setDate(new Date().getDate() - DAYS_FROM_TODAY);

			res = await authGetRequest(`/habits`, token).query({
				dateFrom: pastDate
			});

			expect(res.statusCode).toBe(400);
		});
	});

	describe("/habits/-/create", () => {
		it("should_return_200_for_valid_data", async () => {
			const newHabits = {
				name: chance.string(),
				description: chance.string(),
				periodInDays: chance.natural({ min: 1, max: 31 })
			};

			res = await authPostRequest(`/habits/-/create`, token).send(newHabits);

			expect(res.statusCode).toBe(200);

			const { habitId } = res.body.data;

			expect(habitId).toBeString();
		});

		it("should_return_400_for_invalid_data", async () => {
			const newHabits = {
				wrongField: chance.string(),
				description: chance.string(),
				periodInDays: chance.natural({ min: 1, max: 31 })
			};

			res = await authPostRequest(`/habits/-/create`, token).send(newHabits);

			expect(res.statusCode).toBe(400);
		});

		it("should_return_400_for_missing_name", async () => {
			const newHabits = {
				description: chance.string(),
				periodInDays: chance.natural({ min: 1, max: 31 })
			};

			res = await authPostRequest(`/habits/-/create`, token).send(newHabits);

			expect(res.statusCode).toBe(400);
		});

		it("should_return_400_for_missing_periodInDays", async () => {
			const newHabits = {
				name: chance.string(),
				description: chance.string()
			};

			res = await authPostRequest(`/habits/-/create`, token).send(newHabits);

			expect(res.statusCode).toBe(400);
		});
	});

	describe("/habits/:habitId/update", () => {
		it("should_return_200_for_valid_data", async () => {
			const updatedHabit = {
				newName: chance.string(),
				newDescription: chance.string(),
				newPeriodInDays: chance.natural({ min: 1, max: 31 })
			};

			res = await authPostRequest(`/habits/64e1ec8115d01e5e7ecb21ff/update`, token).send(
				updatedHabit
			);

			expect(res.statusCode).toBe(200);
		});

		it("should_return_400_for_invalid_data", async () => {
			const updatedHabit = {
				newName: chance.string()
			};

			res = await authPostRequest(`/habits/64e1ec8115d01e5e7ecb21ff/update`, token).send(
				updatedHabit
			);

			expect(res.statusCode).toBe(400);
		});

		it("should_return_400_for_missing_newName", async () => {
			const updatedHabit = {
				newDescription: chance.string(),
				newPeriodInDays: chance.natural({ min: 1, max: 31 })
			};

			res = await authPostRequest(`/habits/64e1ec8115d01e5e7ecb21ff/update`, token).send(
				updatedHabit
			);

			expect(res.statusCode).toBe(400);
		});

		it("should_return_400_for_missing_newPeriodInDays", async () => {
			const updatedHabit = {
				newName: chance.string()
			};

			res = await authPostRequest(`/habits/64e1ec8115d01e5e7ecb21ff/update`, token).send(
				updatedHabit
			);

			expect(res.statusCode).toBe(400);
		});
	});

	describe("/habits/groupsOfHabits/update", () => {
		it("should_return_200_for_valid_data", async () => {
			const newGroupsOfHabits = [
				{
					_id: "1119c387193a1188daa2a113",
					name: "test",
					habitsIds: [
						"1219c387193a1188daa2a113",
						"1229c387193a1188daa2a113",
						"1239c387193a1188daa2a113"
					]
				}
			];

			res = await authPostRequest(`/habits/groupsOfHabits/update`, token).send({
				newGroupsOfHabits
			});

			expect(res.statusCode).toBe(200);
		});

		it("should_return_400_for_invalid_data", async () => {
			const newGroupsOfHabits = [
				{
					_id: "1119c387193a1188daa2a113",
					name_wrong_field: "test",
					habitsIds: [
						"1119c387193a1188daa2a113",
						"1129c387193a1188daa2a113",
						"1139c387193a1188daa2a113"
					]
				}
			];

			res = await authPostRequest(`/habits/groupsOfHabits/update`, token).send({
				newGroupsOfHabits
			});

			expect(res.statusCode).toBe(400);
		});

		it("should_return_400_for_missing_newGroupsOfHabits", async () => {
			res = await authPostRequest(`/habits/groupsOfHabits/update`, token);

			expect(res.statusCode).toBe(400);
		});
	});
});
