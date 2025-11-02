import "dotenv/config";
import prisma from "./config/database.js";
import { hashPassword } from "./utils/auth.js";

// Check if database is empty and seed if needed
async function checkAndSeed() {
    try {
        const userCount = await prisma.user.count();

        if (userCount === 0) {
            console.log("📦 Database is empty, running initial seed...");

            // Create demo users
            const adminPassword = await hashPassword("admin123");
            const userPassword = await hashPassword("user123");

            const adminUser = await prisma.user.create({
                data: {
                    email: "admin@demo.com",
                    password: adminPassword,
                    name: "Admin User",
                },
            });

            const regularUser = await prisma.user.create({
                data: {
                    email: "user@demo.com",
                    password: userPassword,
                    name: "Regular User",
                },
            });

            console.log("✅ Created demo users");

            // Create a demo group
            const demoGroup = await prisma.group.create({
                data: {
                    name: "Demo Robotics Team",
                    members: {
                        create: [
                            {
                                userId: adminUser.id,
                                role: "ADMIN",
                            },
                            {
                                userId: regularUser.id,
                                role: "MEMBER",
                            },
                        ],
                    },
                },
            });

            console.log("✅ Created demo group");

            // Create personal robot for admin
            const personalRobot = await prisma.robot.create({
                data: {
                    serialNumber: "SN-PERSONAL-001",
                    name: "Admin Personal Robot",
                    ownerType: "USER",
                    ownerId: adminUser.id,
                },
            });

            console.log("✅ Created personal robot");

            // Create group-owned robots
            const groupRobot1 = await prisma.robot.create({
                data: {
                    serialNumber: "SN-GROUP-001",
                    name: "Team Warehouse Bot",
                    ownerType: "GROUP",
                    ownerId: demoGroup.id,
                },
            });

            const groupRobot2 = await prisma.robot.create({
                data: {
                    serialNumber: "SN-GROUP-002",
                    name: "Team Delivery Bot",
                    ownerType: "GROUP",
                    ownerId: demoGroup.id,
                },
            });

            console.log("✅ Created group robots");

            // Grant permissions to regular user for group robots
            await prisma.robotPermission.create({
                data: {
                    userId: regularUser.id,
                    robotId: groupRobot1.id,
                    permissionType: "USAGE",
                },
            });

            await prisma.robotPermission.create({
                data: {
                    userId: regularUser.id,
                    robotId: groupRobot2.id,
                    permissionType: "ADMIN",
                },
            });

            // Admin also gets permissions
            await prisma.robotPermission.create({
                data: {
                    userId: adminUser.id,
                    robotId: groupRobot1.id,
                    permissionType: "ADMIN",
                },
            });

            await prisma.robotPermission.create({
                data: {
                    userId: adminUser.id,
                    robotId: groupRobot2.id,
                    permissionType: "ADMIN",
                },
            });

            console.log("✅ Created permissions");

            // Create sample settings
            await prisma.robotSetting.create({
                data: {
                    userId: adminUser.id,
                    robotId: personalRobot.id,
                    settings: JSON.stringify({
                        theme: "dark",
                        language: "en",
                        notifications: true,
                        speed: "fast",
                    }),
                },
            });

            await prisma.robotSetting.create({
                data: {
                    userId: regularUser.id,
                    robotId: groupRobot1.id,
                    settings: JSON.stringify({
                        theme: "light",
                        language: "en",
                        notifications: false,
                        speed: "medium",
                    }),
                },
            });

            console.log("✅ Created sample settings");

            console.log("\n🎉 Initial seed completed!\n");
            console.log("Demo Accounts:");
            console.log("─────────────────────────────────────");
            console.log("Admin: admin@demo.com / admin123");
            console.log("User: user@demo.com / user123");
            console.log("─────────────────────────────────────\n");
        } else {
            console.log(
                `✅ Database already has ${userCount} users, skipping seed`
            );
        }
    } catch (error) {
        console.error("❌ Error during startup seed check:", error);
        // Don't throw - let the app start even if seed fails
    }
}

export default checkAndSeed;
