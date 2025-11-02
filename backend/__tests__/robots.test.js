import request from "supertest";
import { createApp } from "../src/app.js";
import prisma from "../src/config/database.js";

const app = createApp();

describe("Robot Management Endpoints", () => {
    let authToken;
    let userId;
    let testRobotSerialNumber;

    beforeAll(async () => {
        // Clean up test data
        await prisma.user.deleteMany({
            where: { email: "robottest@example.com" },
        });

        // Register a test user
        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send({
                name: "robottest",
                email: "robottest@example.com",
                password: "password123",
            });

        authToken = registerResponse.body.token;
        userId = registerResponse.body.user.id;
    });

    afterAll(async () => {
        // Clean up test data
        await prisma.robot.deleteMany({
            where: { ownerId: userId },
        });
        await prisma.user.deleteMany({
            where: { email: "robottest@example.com" },
        });
        await prisma.$disconnect();
    });

    describe("POST /api/robots", () => {
        it("should create a robot with valid data", async () => {
            const response = await request(app)
                .post("/api/robots")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    name: "Test Robot",
                    serialNumber: `TEST-${Date.now()}`,
                    model: "Model X",
                    ownerType: "USER",
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("id");
            expect(response.body.name).toBe("Test Robot");
            expect(response.body.ownerId).toBe(userId);
            expect(response.body.ownerType).toBe("USER");

            testRobotSerialNumber = response.body.serialNumber;
        });

        it("should fail without authentication", async () => {
            const response = await request(app)
                .post("/api/robots")
                .send({
                    name: "Unauthorized Robot",
                    serialNumber: `UNAUTH-${Date.now()}`,
                    model: "Model Y",
                    ownerType: "USER",
                });

            expect(response.status).toBe(401);
        });

        it("should fail with missing required fields", async () => {
            const response = await request(app)
                .post("/api/robots")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    name: "Incomplete Robot",
                });

            expect(response.status).toBe(400);
        });

        it("should fail with duplicate serial number", async () => {
            const response = await request(app)
                .post("/api/robots")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    name: "Duplicate Robot",
                    serialNumber: testRobotSerialNumber, // Use same serial number
                    model: "Model Z",
                    ownerType: "USER",
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe("Serial number already exists");
        });
    });

    describe("GET /api/robots", () => {
        it("should retrieve user's robots", async () => {
            const response = await request(app)
                .get("/api/robots")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0]).toHaveProperty("name");
            expect(response.body[0]).toHaveProperty("serialNumber");
        });

        it("should fail without authentication", async () => {
            const response = await request(app).get("/api/robots");

            expect(response.status).toBe(401);
        });
    });

    describe("GET /api/robots/:serialNumber", () => {
        it("should retrieve robot details by serial number", async () => {
            const response = await request(app)
                .get(`/api/robots/${testRobotSerialNumber}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.serialNumber).toBe(testRobotSerialNumber);
            expect(response.body).toHaveProperty("name");
        });

        it("should fail for non-existent robot", async () => {
            const response = await request(app)
                .get("/api/robots/NONEXISTENT-123")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(404);
        });

        it("should fail without authentication", async () => {
            const response = await request(app).get(
                `/api/robots/${testRobotSerialNumber}`
            );

            expect(response.status).toBe(401);
        });
    });

    describe("DELETE /api/robots/:serialNumber", () => {
        let robotToDelete;

        beforeAll(async () => {
            // Create a robot specifically for deletion test
            const response = await request(app)
                .post("/api/robots")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    name: "Robot to Delete",
                    serialNumber: `DELETE-${Date.now()}`,
                    model: "Model D",
                    ownerType: "USER",
                });
            robotToDelete = response.body.serialNumber;
        });

        it("should delete owned robot", async () => {
            const response = await request(app)
                .delete(`/api/robots/${robotToDelete}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toContain("deleted");

            // Verify robot is deleted
            const getResponse = await request(app)
                .get(`/api/robots/${robotToDelete}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(getResponse.status).toBe(404);
        });

        it("should fail to delete non-existent robot", async () => {
            const response = await request(app)
                .delete("/api/robots/NONEXISTENT-456")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(404);
        });
    });
});
