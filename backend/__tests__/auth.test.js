import request from "supertest";
import { createApp } from "../src/app.js";
import prisma from "../src/config/database.js";

const app = createApp();

describe("Authentication Endpoints", () => {
    beforeAll(async () => {
        // Clean up test users before running tests
        await prisma.user.deleteMany({
            where: {
                email: {
                    in: ["testuser@example.com", "loginuser@example.com"],
                },
            },
        });
    });

    afterAll(async () => {
        // Clean up test users after tests
        await prisma.user.deleteMany({
            where: {
                email: {
                    in: ["testuser@example.com", "loginuser@example.com"],
                },
            },
        });
        await prisma.$disconnect();
    });

    describe("POST /api/auth/register", () => {
        it("should register a new user successfully", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "testuser",
                    email: "testuser@example.com",
                    password: "password123",
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("token");
            expect(response.body.user).toHaveProperty("id");
            expect(response.body.user.email).toBe("testuser@example.com");
            expect(response.body.user.name).toBe("testuser");
            expect(response.body.user).not.toHaveProperty("password");
        });

        it("should fail with missing fields", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    email: "incomplete@example.com",
                });

            expect(response.status).toBe(400);
        });

        it("should fail with duplicate email", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "duplicate",
                    email: "testuser@example.com", // Already registered above
                    password: "password123",
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe("Email already registered");
        });

        it("should fail with invalid email format", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "testuser2",
                    email: "invalid-email",
                    password: "password123",
                });

            expect(response.status).toBe(400);
        });
    });

    describe("POST /api/auth/login", () => {
        beforeAll(async () => {
            // Create a user for login tests
            await request(app).post("/api/auth/register").send({
                name: "loginuser",
                email: "loginuser@example.com",
                password: "password123",
            });
        });

        it("should login successfully with correct credentials", async () => {
            const response = await request(app).post("/api/auth/login").send({
                email: "loginuser@example.com",
                password: "password123",
            });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("token");
            expect(response.body.user.email).toBe("loginuser@example.com");
        });

        it("should fail with incorrect password", async () => {
            const response = await request(app).post("/api/auth/login").send({
                email: "loginuser@example.com",
                password: "wrongpassword",
            });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe("Invalid credentials");
        });

        it("should fail with non-existent email", async () => {
            const response = await request(app).post("/api/auth/login").send({
                email: "nonexistent@example.com",
                password: "password123",
            });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe("Invalid credentials");
        });

        it("should fail with missing fields", async () => {
            const response = await request(app).post("/api/auth/login").send({
                email: "loginuser@example.com",
            });

            expect(response.status).toBe(400);
        });
    });
});
