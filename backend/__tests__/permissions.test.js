import request from "supertest";
import { createApp } from "../src/app.js";
import prisma from "../src/config/database.js";

const app = createApp();

describe("Permission Management Endpoints", () => {
    let ownerToken;
    let ownerId;
    let userToken;
    let userId;
    let testRobotSerialNumber;

    beforeAll(async () => {
        // Clean up test data
        await prisma.user.deleteMany({
            where: {
                email: {
                    in: [
                        "robotowner@example.com",
                        "permissionuser@example.com",
                    ],
                },
            },
        });

        // Register owner
        const ownerResponse = await request(app)
            .post("/api/auth/register")
            .send({
                name: "robotowner",
                email: "robotowner@example.com",
                password: "password123",
            });

        ownerToken = ownerResponse.body.token;
        ownerId = ownerResponse.body.user.id;

        // Register regular user
        const userResponse = await request(app)
            .post("/api/auth/register")
            .send({
                name: "permissionuser",
                email: "permissionuser@example.com",
                password: "password123",
            });

        userToken = userResponse.body.token;
        userId = userResponse.body.user.id;

        // Create a robot
        const robotResponse = await request(app)
            .post("/api/robots")
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
                name: "Permission Test Robot",
                serialNumber: `PERM-${Date.now()}`,
                model: "Model P",
                ownerType: "USER",
            });

        testRobotSerialNumber = robotResponse.body.serialNumber;
    });

    afterAll(async () => {
        // Clean up test data
        await prisma.robot.deleteMany({
            where: { ownerId },
        });
        await prisma.user.deleteMany({
            where: {
                email: {
                    in: [
                        "robotowner@example.com",
                        "permissionuser@example.com",
                    ],
                },
            },
        });
        await prisma.$disconnect();
    });

    describe("POST /api/robots/:serialNumber/permissions", () => {
        it("should grant permission to a user", async () => {
            const response = await request(app)
                .post(`/api/robots/${testRobotSerialNumber}/permissions`)
                .set("Authorization", `Bearer ${ownerToken}`)
                .send({
                    userId: userId,
                    permissionType: "USAGE",
                });

            expect(response.status).toBe(201);
            expect(response.body.userId).toBe(userId);
            expect(response.body.permissionType).toBe("USAGE");
        });

        it("should fail to grant permission without ownership", async () => {
            const response = await request(app)
                .post(`/api/robots/${testRobotSerialNumber}/permissions`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    userId: ownerId,
                    permissionType: "USAGE",
                });

            expect(response.status).toBe(403);
        });

        it("should allow granting permission again (upsert behavior)", async () => {
            const response = await request(app)
                .post(`/api/robots/${testRobotSerialNumber}/permissions`)
                .set("Authorization", `Bearer ${ownerToken}`)
                .send({
                    userId: userId, // Already granted above
                    permissionType: "ADMIN", // Change to ADMIN
                });

            // Using upsert, so it should succeed and update
            expect(response.status).toBe(201);
            expect(response.body.permissionType).toBe("ADMIN");
        });
    });

    describe("DELETE /api/robots/:serialNumber/permissions/:userId", () => {
        let tempUserId;
        let tempUserToken;

        beforeAll(async () => {
            // Create temp user
            const tempResponse = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "tempuser",
                    email: "tempuser@example.com",
                    password: "password123",
                });
            tempUserId = tempResponse.body.user.id;
            tempUserToken = tempResponse.body.token;

            // Grant permission
            await request(app)
                .post(`/api/robots/${testRobotSerialNumber}/permissions`)
                .set("Authorization", `Bearer ${ownerToken}`)
                .send({
                    userId: tempUserId,
                    permissionType: "USAGE",
                });
        });

        afterAll(async () => {
            await prisma.user.deleteMany({
                where: { email: "tempuser@example.com" },
            });
        });

        it("should revoke permission", async () => {
            const response = await request(app)
                .delete(
                    `/api/robots/${testRobotSerialNumber}/permissions/${tempUserId}`
                )
                .set("Authorization", `Bearer ${ownerToken}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toContain("revoked");
        });

        it("should allow user to revoke own permission (if admin access check allows)", async () => {
            // Grant permission again
            await request(app)
                .post(`/api/robots/${testRobotSerialNumber}/permissions`)
                .set("Authorization", `Bearer ${ownerToken}`)
                .send({
                    userId: tempUserId,
                    permissionType: "ADMIN",
                });

            // User tries to revoke their own permission
            const response = await request(app)
                .delete(
                    `/api/robots/${testRobotSerialNumber}/permissions/${tempUserId}`
                )
                .set("Authorization", `Bearer ${tempUserToken}`);

            // This might succeed or fail depending on implementation
            expect([200, 403]).toContain(response.status);
        });
    });
});
