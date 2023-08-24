import request from "supertest";
import { describe, expect, it } from "@jest/globals";
import { validateEnvTest } from "../utils/validate_env_test";

validateEnvTest();

const { API_URL, USERNAME_CORRECT, PASSWORD_CORRECT } = process.env;

describe("API WORKING", () => {
    it("server working", async () => {
        const res = await request(API_URL).get("/auth/working");
        expect(res.statusCode).toBe(200);
    });
});

describe("Auth controller", () => {
    let token;

    beforeAll(async () => {
        const res = await request(API_URL).post("/auth/login").send({
            username: USERNAME_CORRECT,
            password: PASSWORD_CORRECT,
        });
        token = res.body.token;
    });

    it("login_correct", async () => {
        const res = await request(API_URL).post("/auth/login").send({
            username: USERNAME_CORRECT,
            password: PASSWORD_CORRECT,
        });
        expect(res.statusCode).toBe(200);
    });
    it("login_wrong", async () => {
        const res = await request(API_URL)
            .post("/auth/login")
            .send({
                username: USERNAME_CORRECT + "wrong",
                password: USERNAME_CORRECT + "wrong",
            });
        expect(res.statusCode).toBe(400);
    });
});
