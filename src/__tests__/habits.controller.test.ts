import * as dotenv from "dotenv";
import * as request from "supertest";

dotenv.config({ path: ".env.test" });

import { authGetRequest, authPostRequest, expectedBody, myAfterEach } from "./useful";

const { API_URL, PASSWORD_CORRECT, USERNAME_CORRECT, DAYS_FROM_TODAY } = process.env;

describe("Habits controller", () => {
	let token: string;
	let res: request.Response;

	beforeAll(async () => {
		const res = await request(API_URL).post("/auth/login").send({
			password: PASSWORD_CORRECT,
			username: USERNAME_CORRECT
		});

		token = res.body.data.token;
	});

	afterEach(() => {
		myAfterEach(res);
	});

	describe("/habits", () => {
		it("should_return_200_for_valid_dateFrom_myHabits", async () => {
			const pastDate = new Date();

			pastDate.setDate(new Date().getDate() - parseInt(DAYS_FROM_TODAY!));

			res = await authGetRequest(`/habits`, token)
				.query({
					dateFrom: pastDate,
					myHabits: true
				})
				.query({ dateFrom: pastDate, myHabits: true });

			expect(res.statusCode).toBe(200);

			expect(res.body).toStrictEqual(
				expectedBody({
					habits: expect.arrayContaining([
						expect.objectContaining({
							_id: expect.any(String),
							name: expect.any(String),
							description: expect.any(String),
							periodInDays: expect.any(Number),
							activities: expect.arrayContaining([
								expect.objectContaining({
									_id: expect.any(String),
									date: expect.any(String)
								})
							])
						})
					]),
					groupsOfHabits: expect.arrayContaining([
						expect.objectContaining({
							_id: expect.any(String),
							name: expect.any(String),
							habitsIds: expect.arrayContaining([expect.any(String)])
						})
					])
				})
			);
		});

		it("should_return_400_for_future_date", async () => {
			const pastDate = new Date();

			pastDate.setDate(new Date().getDate() + parseInt(DAYS_FROM_TODAY!));

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

			pastDate.setDate(new Date().getDate() - parseInt(DAYS_FROM_TODAY!));

			res = await authGetRequest(`/habits`, token).query({
				dateFrom: pastDate
			});

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
						"1119c387193a1188daa2a113",
						"1129c387193a1188daa2a113",
						"1139c387193a1188daa2a113"
					]
				}
			];

			res = await authPostRequest(`/habits/groupsOfHabits/update`, token).send({
				newGroupsOfHabits
			});

			expect(res.statusCode).toBe(200);
		});

		it("should_return_200_for_invalid_data", async () => {
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

		it("should_return_200_for_missing_newGroupsOfHabits", async () => {
			res = await authPostRequest(`/habits/groupsOfHabits/update`, token);

			expect(res.statusCode).toBe(400);
		});
	});
});
