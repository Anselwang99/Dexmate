import request from "supertest";
import { createApp } from "../src/app.js";
import prisma from "../src/config/database.js";

const app = createApp();

describe("Group Management Endpoints", () => {
    let authToken;
    let userId;
    let testGroupId;
    let memberToken;
    let memberId;

    beforeAll(async () => {
        // Clean up test data
        await prisma.user.deleteMany({
            where: {
                email: {
                    in: ["groupadmin@example.com", "groupmember@example.com"],
                },
            },
        });

        // Register admin user
        const adminResponse = await request(app)
            .post("/api/auth/register")
            .send({
                name: "groupadmin",
                email: "groupadmin@example.com",
                password: "password123",
            });

        authToken = adminResponse.body.token;
        userId = adminResponse.body.user.id;

        // Register member user
        const memberResponse = await request(app)
            .post("/api/auth/register")
            .send({
                name: "groupmember",
                email: "groupmember@example.com",
                password: "password123",
            });

        memberToken = memberResponse.body.token;
        memberId = memberResponse.body.user.id;
    });

    afterAll(async () => {
        // Clean up test data - delete groups where the user is admin
        const groups = await prisma.group.findMany({
            where: {
                members: {
                    some: {
                        userId: userId,
                        role: "ADMIN",
                    },
                },
            },
        });

        for (const group of groups) {
            await prisma.group.delete({ where: { id: group.id } });
        }

        await prisma.user.deleteMany({
            where: {
                email: {
                    in: ["groupadmin@example.com", "groupmember@example.com"],
                },
            },
        });
        await prisma.$disconnect();
    });

    describe("POST /api/groups", () => {
        it("should create a group successfully", async () => {
            const response = await request(app)
                .post("/api/groups")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    name: "Test Group",
                    description: "A test group for unit tests",
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("id");
            expect(response.body.name).toBe("Test Group");
            // Group doesn't have adminId, but members array should have the admin

            testGroupId = response.body.id;
        });

        it("should fail without authentication", async () => {
            const response = await request(app).post("/api/groups").send({
                name: "Unauthorized Group",
                description: "This should fail",
            });

            expect(response.status).toBe(401);
        });

        it("should fail with missing name", async () => {
            const response = await request(app)
                .post("/api/groups")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    description: "Missing name",
                });

            expect(response.status).toBe(400);
        });
    });

    describe("GET /api/groups", () => {
        it("should retrieve user's groups", async () => {
            const response = await request(app)
                .get("/api/groups")
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });

        it("should fail without authentication", async () => {
            const response = await request(app).get("/api/groups");

            expect(response.status).toBe(401);
        });
    });

    describe("POST /api/groups/:id/members", () => {
        it("should add a member to the group", async () => {
            const response = await request(app)
                .post(`/api/groups/${testGroupId}/members`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    email: "groupmember@example.com",
                    role: "MEMBER",
                });

            expect(response.status).toBe(201);
            expect(response.body.userId).toBe(memberId);
            expect(response.body.role).toBe("MEMBER");
        });

        it("should fail to add member without admin permission", async () => {
            const response = await request(app)
                .post(`/api/groups/${testGroupId}/members`)
                .set("Authorization", `Bearer ${memberToken}`)
                .send({
                    email: "groupadmin@example.com",
                    role: "MEMBER",
                });

            expect(response.status).toBe(403);
        });

        it("should fail to add duplicate member", async () => {
            const response = await request(app)
                .post(`/api/groups/${testGroupId}/members`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    email: "groupmember@example.com", // Already added above
                    role: "MEMBER",
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain("already a member");
        });
    });

    describe("DELETE /api/groups/:groupId/members/:userId", () => {
        let tempMemberId;

        beforeAll(async () => {
            // Create another user to remove
            const tempResponse = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "tempmember",
                    email: "tempmember@example.com",
                    password: "password123",
                });
            tempMemberId = tempResponse.body.user.id;

            // Add to group
            await request(app)
                .post(`/api/groups/${testGroupId}/members`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    email: "tempmember@example.com",
                    role: "MEMBER",
                });
        });

        afterAll(async () => {
            await prisma.user.deleteMany({
                where: { email: "tempmember@example.com" },
            });
        });

        it("should remove a member from the group", async () => {
            const response = await request(app)
                .delete(`/api/groups/${testGroupId}/members/${tempMemberId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toContain("removed");
        });

        it("should fail to remove member without admin permission", async () => {
            const response = await request(app)
                .delete(`/api/groups/${testGroupId}/members/${userId}`)
                .set("Authorization", `Bearer ${memberToken}`);

            expect(response.status).toBe(403);
        });
    });
});
