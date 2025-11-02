import prisma from "../config/database.js";

export const createGroup = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Group name is required" });
        }

        const group = await prisma.group.create({
            data: {
                name,
                members: {
                    create: {
                        userId: req.user.id,
                        role: "ADMIN",
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, email: true, name: true },
                        },
                    },
                },
            },
        });

        res.status(201).json(group);
    } catch (error) {
        console.error("Create group error:", error);
        res.status(500).json({ error: "Failed to create group" });
    }
};

export const getGroups = async (req, res) => {
    try {
        console.log("Getting groups for user:", req.user);

        // Get all groups where the user is a member
        const userGroups = await prisma.group.findMany({
            where: {
                members: {
                    some: {
                        userId: req.user.id,
                    },
                },
            },
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

        console.log(`Found ${userGroups.length} groups`);

        // Get the user's role in each group and fetch robots separately
        const groupsWithRolesAndRobots = await Promise.all(
            userGroups.map(async (group) => {
                const membership = group.members.find(
                    (member) => member.userId === req.user.id
                );

                // Fetch robots separately since they're not included in the group query
                const robots = await prisma.robot.findMany({
                    where: {
                        ownerType: "GROUP",
                        ownerId: group.id,
                    },
                });

                return {
                    ...group,
                    userRole: membership.role,
                    robots: robots,
                };
            })
        );

        console.log(
            `Processed ${groupsWithRolesAndRobots.length} groups with roles and robots`
        );
        res.json(groupsWithRolesAndRobots);
    } catch (error) {
        console.error("Get groups error:", error);
        console.error(error.stack);
        res.status(500).json({
            error: "Failed to get groups",
            details:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

export const getGroup = async (req, res) => {
    try {
        const { id } = req.params;

        const group = await prisma.group.findFirst({
            where: {
                id,
                members: {
                    some: {
                        userId: req.user.id,
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, email: true, name: true },
                        },
                    },
                },
                robots: {
                    include: {
                        permissions: {
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
                },
            },
        });

        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        res.json(group);
    } catch (error) {
        console.error("Get group error:", error);
        res.status(500).json({ error: "Failed to get group" });
    }
};

export const addMember = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, role = "MEMBER" } = req.body;

        if (!email) {
            return res.status(400).json({ error: "User email is required" });
        }

        // Check if current user is admin of the group
        const membership = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: req.user.id,
                    groupId: id,
                },
            },
        });

        if (!membership || membership.role !== "ADMIN") {
            return res
                .status(403)
                .json({ error: "Only group admins can add members" });
        }

        const userToAdd = await prisma.user.findUnique({ where: { email } });
        if (!userToAdd) {
            return res.status(404).json({ error: "User not found" });
        }

        const newMember = await prisma.groupMember.create({
            data: {
                userId: userToAdd.id,
                groupId: id,
                role,
            },
            include: {
                user: {
                    select: { id: true, email: true, name: true },
                },
            },
        });

        res.status(201).json(newMember);
    } catch (error) {
        if (error.code === "P2002") {
            return res
                .status(400)
                .json({ error: "User is already a member of this group" });
        }
        console.error("Add member error:", error);
        res.status(500).json({ error: "Failed to add member" });
    }
};

export const removeMember = async (req, res) => {
    try {
        const { id, userId } = req.params;

        // Check if current user is admin of the group
        const membership = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: req.user.id,
                    groupId: id,
                },
            },
        });

        if (!membership || membership.role !== "ADMIN") {
            return res
                .status(403)
                .json({ error: "Only group admins can remove members" });
        }

        // Get all group-owned robots
        const groupRobots = await prisma.robot.findMany({
            where: {
                ownerType: "GROUP",
                ownerId: id,
            },
            select: {
                id: true,
            },
        });

        // Remove all robot permissions for this user on group-owned robots
        const robotIds = groupRobots.map((robot) => robot.id);
        if (robotIds.length > 0) {
            await prisma.robotPermission.deleteMany({
                where: {
                    userId: userId,
                    robotId: {
                        in: robotIds,
                    },
                },
            });
        }

        // Remove the group membership
        await prisma.groupMember.delete({
            where: {
                userId_groupId: {
                    userId,
                    groupId: id,
                },
            },
        });

        res.json({ message: "Member removed successfully" });
    } catch (error) {
        console.error("Remove member error:", error);
        res.status(500).json({ error: "Failed to remove member" });
    }
};

export const updateMemberRole = async (req, res) => {
    try {
        const { id, userId } = req.params;
        const { role } = req.body;

        if (!role || !["ADMIN", "MEMBER"].includes(role)) {
            return res
                .status(400)
                .json({ error: "Valid role is required (ADMIN or MEMBER)" });
        }

        // Check if current user is admin of the group
        const membership = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: req.user.id,
                    groupId: id,
                },
            },
        });

        if (!membership || membership.role !== "ADMIN") {
            return res
                .status(403)
                .json({ error: "Only group admins can update member roles" });
        }

        const updatedMember = await prisma.groupMember.update({
            where: {
                userId_groupId: {
                    userId,
                    groupId: id,
                },
            },
            data: { role },
            include: {
                user: {
                    select: { id: true, email: true, name: true },
                },
            },
        });

        res.json(updatedMember);
    } catch (error) {
        console.error("Update member role error:", error);
        res.status(500).json({ error: "Failed to update member role" });
    }
};

export const deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if current user is admin of the group
        const membership = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: req.user.id,
                    groupId: id,
                },
            },
        });

        if (!membership || membership.role !== "ADMIN") {
            return res
                .status(403)
                .json({ error: "Only group admins can delete the group" });
        }

        // Delete all robots owned by this group
        // This will cascade delete robot permissions and settings
        await prisma.robot.deleteMany({
            where: {
                ownerType: "GROUP",
                ownerId: id,
            },
        });

        // Delete the group
        // This will cascade delete all group members
        await prisma.group.delete({
            where: { id },
        });

        res.json({ message: "Group deleted successfully" });
    } catch (error) {
        console.error("Delete group error:", error);
        res.status(500).json({ error: "Failed to delete group" });
    }
};
