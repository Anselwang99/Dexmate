import prisma from "../config/database.js";

// Helper function to check if user has access to a robot
const checkRobotAccess = async (userId, robotId) => {
    const robot = await prisma.robot.findUnique({
        where: { id: robotId },
        include: {
            permissions: true,
        },
    });

    if (!robot) return null;

    // Check if user owns the robot
    if (robot.ownerType === "USER" && robot.ownerId === userId) {
        return { robot, hasAccess: true, isAdmin: true };
    }

    // Check if user is in the group that owns the robot
    if (robot.ownerType === "GROUP") {
        const groupMember = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: userId,
                    groupId: robot.ownerId,
                },
            },
        });

        if (groupMember) {
            const permission = robot.permissions.find(
                (p) => p.userId === userId
            );
            return {
                robot,
                hasAccess: !!permission || groupMember.role === "ADMIN",
                isAdmin:
                    permission?.permissionType === "ADMIN" ||
                    groupMember.role === "ADMIN",
            };
        }
    }

    // Check direct permissions
    const permission = robot.permissions.find((p) => p.userId === userId);
    return {
        robot,
        hasAccess: !!permission,
        isAdmin: permission?.permissionType === "ADMIN",
    };
};

export const createRobot = async (req, res) => {
    try {
        const { serialNumber, name, ownerType, ownerId } = req.body;

        if (!serialNumber || !name || !ownerType) {
            return res.status(400).json({
                error: "Serial number, name, and owner type are required",
            });
        }

        if (!["USER", "GROUP"].includes(ownerType)) {
            return res
                .status(400)
                .json({ error: "Owner type must be USER or GROUP" });
        }

        let finalOwnerId = ownerId;

        // If creating user-owned robot and no ownerId specified, use current user
        if (ownerType === "USER" && !ownerId) {
            finalOwnerId = req.user.id;
        }

        // Verify the owner exists and user has proper permissions
        if (ownerType === "USER") {
            const user = await prisma.user.findUnique({
                where: { id: finalOwnerId },
            });

            if (!user) {
                return res.status(400).json({ error: "User owner not found" });
            }

            if (finalOwnerId !== req.user.id) {
                return res.status(403).json({
                    error: "Cannot create robots for other users",
                });
            }
        } else if (ownerType === "GROUP") {
            if (!finalOwnerId) {
                return res.status(400).json({
                    error: "Owner ID is required for group-owned robots",
                });
            }

            const group = await prisma.group.findUnique({
                where: { id: finalOwnerId },
                include: {
                    members: true,
                },
            });

            if (!group) {
                return res.status(400).json({ error: "Group not found" });
            }

            const membership = group.members.find(
                (m) => m.userId === req.user.id
            );
            if (!membership || membership.role !== "ADMIN") {
                return res.status(403).json({
                    error: "Only group admins can create group-owned robots",
                });
            }
        }

        // Create the robot
        const robot = await prisma.robot.create({
            data: {
                serialNumber,
                name,
                ownerType,
                ownerId: finalOwnerId,
            },
            include: {
                permissions: true,
            },
        });

        res.status(201).json(robot);
    } catch (error) {
        if (error.code === "P2002") {
            return res
                .status(400)
                .json({ error: "Serial number already exists" });
        }
        console.error("Create robot error:", error);
        res.status(500).json({ error: "Failed to create robot" });
    }
};

export const getRobots = async (req, res) => {
    try {
        console.log("Getting robots for user:", req.user);

        // Get all robots owned by the user
        const userOwnedRobots = await prisma.robot.findMany({
            where: {
                ownerType: "USER",
                ownerId: req.user.id,
            },
            include: {
                permissions: true,
            },
        });

        // Get robots where user has direct permissions
        const robotsWithDirectPermissions = await prisma.robot.findMany({
            where: {
                permissions: {
                    some: {
                        userId: req.user.id,
                    },
                },
            },
            include: {
                permissions: {
                    where: {
                        userId: req.user.id,
                    },
                },
            },
        });

        // Get groups where user is an admin
        const adminGroups = await prisma.groupMember.findMany({
            where: {
                userId: req.user.id,
                role: "ADMIN",
            },
            select: {
                groupId: true,
            },
        });

        const adminGroupIds = adminGroups.map((gm) => gm.groupId);

        // Get all robots owned by groups where user is admin
        const groupAdminRobots = await prisma.robot.findMany({
            where: {
                ownerType: "GROUP",
                ownerId: {
                    in: adminGroupIds,
                },
            },
            include: {
                permissions: true,
            },
        });

        // Combine and deduplicate robots
        const robotMap = new Map();

        // Add user owned robots
        userOwnedRobots.forEach((robot) => {
            robotMap.set(robot.id, {
                ...robot,
                userPermission: "ADMIN", // User owns these robots
            });
        });

        // Add robots from groups where user is admin
        groupAdminRobots.forEach((robot) => {
            if (!robotMap.has(robot.id)) {
                robotMap.set(robot.id, {
                    ...robot,
                    userPermission: "ADMIN", // Group admin has admin access
                });
            }
        });

        // Add robots with direct permissions (including group robots that have been assigned)
        robotsWithDirectPermissions.forEach((robot) => {
            if (!robotMap.has(robot.id)) {
                robotMap.set(robot.id, {
                    ...robot,
                    userPermission:
                        robot.permissions[0]?.permissionType || null,
                });
            }
        });

        const allRobots = Array.from(robotMap.values());

        console.log("User owned robots:", userOwnedRobots.length);
        console.log("Group admin robots:", groupAdminRobots.length);
        console.log(
            "Robots with direct permissions:",
            robotsWithDirectPermissions.length
        );
        console.log("Total unique robots:", allRobots.length);

        res.json(allRobots);
    } catch (error) {
        console.error("Get robots error:", error);
        res.status(500).json({ error: "Failed to get robots" });
    }
};

export const getRobotBySerialNumber = async (req, res) => {
    try {
        const { serialNumber } = req.params;

        // First, get the basic robot information
        const robot = await prisma.robot.findUnique({
            where: { serialNumber },
            include: {
                permissions: true,
            },
        });

        if (!robot) {
            return res.status(404).json({ error: "Robot not found" });
        }

        // Check access
        const access = await checkRobotAccess(req.user.id, robot.id);
        if (
            !access.hasAccess &&
            !(robot.ownerType === "USER" && robot.ownerId === req.user.id)
        ) {
            return res.status(403).json({ error: "Access denied" });
        }

        // Get additional owner information based on owner type
        let ownerInfo = null;
        if (robot.ownerType === "USER") {
            ownerInfo = await prisma.user.findUnique({
                where: { id: robot.ownerId },
                select: { id: true, email: true, name: true },
            });
        } else if (robot.ownerType === "GROUP") {
            ownerInfo = await prisma.group.findUnique({
                where: { id: robot.ownerId },
                include: {
                    members: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    email: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
            });
        }

        // Get permission details
        const permissions = await prisma.robotPermission.findMany({
            where: { robotId: robot.id },
            include: {
                user: {
                    select: { id: true, email: true, name: true },
                },
            },
        });

        res.json({
            ...robot,
            permissions,
            owner: ownerInfo,
            ownerInfo: ownerInfo, // Including both for backward compatibility
            userPermission:
                robot.ownerType === "USER" && robot.ownerId === req.user.id
                    ? "ADMIN"
                    : permissions.find((p) => p.userId === req.user.id)
                          ?.permissionType || null,
        });
    } catch (error) {
        console.error("Get robot error:", error);
        res.status(500).json({ error: "Failed to get robot" });
    }
};

export const grantPermission = async (req, res) => {
    try {
        const { serialNumber } = req.params;
        const { userId, email, permissionType } = req.body;

        if ((!userId && !email) || !permissionType) {
            return res.status(400).json({
                error: "User ID or email and permission type are required",
            });
        }

        if (!["USAGE", "ADMIN"].includes(permissionType)) {
            return res
                .status(400)
                .json({ error: "Permission type must be USAGE or ADMIN" });
        }

        const robot = await prisma.robot.findUnique({
            where: { serialNumber },
        });

        if (!robot) {
            return res.status(404).json({ error: "Robot not found" });
        }

        const access = await checkRobotAccess(req.user.id, robot.id);
        if (!access.isAdmin) {
            return res
                .status(403)
                .json({ error: "Only robot admins can grant permissions" });
        }

        // Find user by ID or email
        let targetUser;
        if (userId) {
            targetUser = await prisma.user.findUnique({
                where: { id: userId },
            });
        } else {
            targetUser = await prisma.user.findUnique({
                where: { email },
            });
        }

        if (!targetUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const permission = await prisma.robotPermission.upsert({
            where: {
                userId_robotId: {
                    userId: targetUser.id,
                    robotId: robot.id,
                },
            },
            update: {
                permissionType,
            },
            create: {
                userId: targetUser.id,
                robotId: robot.id,
                permissionType,
            },
            include: {
                user: {
                    select: { id: true, email: true, name: true },
                },
            },
        });

        res.status(201).json(permission);
    } catch (error) {
        console.error("Grant permission error:", error);
        res.status(500).json({ error: "Failed to grant permission" });
    }
};

export const revokePermission = async (req, res) => {
    try {
        const { serialNumber, userId } = req.params;

        const robot = await prisma.robot.findUnique({
            where: { serialNumber },
        });

        if (!robot) {
            return res.status(404).json({ error: "Robot not found" });
        }

        const access = await checkRobotAccess(req.user.id, robot.id);
        if (!access.isAdmin) {
            return res
                .status(403)
                .json({ error: "Only robot admins can revoke permissions" });
        }

        await prisma.robotPermission.delete({
            where: {
                userId_robotId: {
                    userId,
                    robotId: robot.id,
                },
            },
        });

        res.json({ message: "Permission revoked successfully" });
    } catch (error) {
        console.error("Revoke permission error:", error);
        res.status(500).json({ error: "Failed to revoke permission" });
    }
};

export const deleteRobot = async (req, res) => {
    try {
        const { serialNumber } = req.params;

        const robot = await prisma.robot.findUnique({
            where: { serialNumber },
        });

        if (!robot) {
            return res.status(404).json({ error: "Robot not found" });
        }

        // Only the owner can delete the robot
        const isOwner =
            (robot.ownerType === "USER" && robot.ownerId === req.user.id) ||
            (robot.ownerType === "GROUP" &&
                (await prisma.groupMember.findFirst({
                    where: {
                        userId: req.user.id,
                        groupId: robot.ownerId,
                        role: "ADMIN",
                    },
                })));

        if (!isOwner) {
            return res
                .status(403)
                .json({ error: "Only the robot owner can delete it" });
        }

        // Delete all related data (settings and permissions will be cascade deleted)
        await prisma.robot.delete({
            where: { id: robot.id },
        });

        res.json({ message: "Robot deleted successfully" });
    } catch (error) {
        console.error("Delete robot error:", error);
        res.status(500).json({ error: "Failed to delete robot" });
    }
};
