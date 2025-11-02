import prisma from "../config/database.js";

export const saveSettings = async (req, res) => {
    try {
        const { serialNumber } = req.params;
        const { settings } = req.body;

        if (!settings) {
            return res.status(400).json({ error: "Settings are required" });
        }

        const robot = await prisma.robot.findUnique({
            where: { serialNumber },
        });

        if (!robot) {
            return res.status(404).json({ error: "Robot not found" });
        }

        // Check if user has access (owns robot, has permission, or is group admin)
        let hasAccess = false;

        if (robot.ownerType === "USER" && robot.ownerId === req.user.id) {
            hasAccess = true;
        } else if (robot.ownerType === "GROUP") {
            // Check if user is admin of the group
            const groupMember = await prisma.groupMember.findUnique({
                where: {
                    userId_groupId: {
                        userId: req.user.id,
                        groupId: robot.ownerId,
                    },
                },
            });

            if (groupMember && groupMember.role === "ADMIN") {
                hasAccess = true;
            } else {
                // Check if user has explicit permission
                const permission = await prisma.robotPermission.findFirst({
                    where: {
                        userId: req.user.id,
                        robotId: robot.id,
                    },
                });
                hasAccess = !!permission;
            }
        } else {
            // Check direct permission for other cases
            const permission = await prisma.robotPermission.findFirst({
                where: {
                    userId: req.user.id,
                    robotId: robot.id,
                },
            });
            hasAccess = !!permission;
        }

        if (!hasAccess) {
            return res.status(403).json({ error: "Access denied" });
        }

        const savedSettings = await prisma.robotSetting.upsert({
            where: {
                userId_robotId: {
                    userId: req.user.id,
                    robotId: robot.id,
                },
            },
            update: {
                settings: JSON.stringify(settings),
            },
            create: {
                userId: req.user.id,
                robotId: robot.id,
                settings: JSON.stringify(settings),
            },
        });

        res.json({
            ...savedSettings,
            settings: JSON.parse(savedSettings.settings),
        });
    } catch (error) {
        console.error("Save settings error:", error);
        res.status(500).json({ error: "Failed to save settings" });
    }
};

export const getSettings = async (req, res) => {
    try {
        const { serialNumber } = req.params;

        const robot = await prisma.robot.findUnique({
            where: { serialNumber },
        });

        if (!robot) {
            return res.status(404).json({ error: "Robot not found" });
        }

        // Check if user has access (owns robot, has permission, or is group admin)
        let hasAccess = false;

        if (robot.ownerType === "USER" && robot.ownerId === req.user.id) {
            hasAccess = true;
        } else if (robot.ownerType === "GROUP") {
            // Check if user is admin of the group
            const groupMember = await prisma.groupMember.findUnique({
                where: {
                    userId_groupId: {
                        userId: req.user.id,
                        groupId: robot.ownerId,
                    },
                },
            });

            if (groupMember && groupMember.role === "ADMIN") {
                hasAccess = true;
            } else {
                // Check if user has explicit permission
                const permission = await prisma.robotPermission.findFirst({
                    where: {
                        userId: req.user.id,
                        robotId: robot.id,
                    },
                });
                hasAccess = !!permission;
            }
        } else {
            // Check direct permission for other cases
            const permission = await prisma.robotPermission.findFirst({
                where: {
                    userId: req.user.id,
                    robotId: robot.id,
                },
            });
            hasAccess = !!permission;
        }

        if (!hasAccess) {
            return res.status(403).json({ error: "Access denied" });
        }

        const userSettings = await prisma.robotSetting.findUnique({
            where: {
                userId_robotId: {
                    userId: req.user.id,
                    robotId: robot.id,
                },
            },
        });

        if (!userSettings) {
            return res.json({ settings: {} });
        }

        res.json({
            ...userSettings,
            settings: JSON.parse(userSettings.settings),
        });
    } catch (error) {
        console.error("Get settings error:", error);
        res.status(500).json({ error: "Failed to get settings" });
    }
};

export const getAllSettings = async (req, res) => {
    try {
        const allSettings = await prisma.robotSetting.findMany({
            where: {
                userId: req.user.id,
            },
            include: {
                robot: {
                    select: {
                        id: true,
                        serialNumber: true,
                        name: true,
                    },
                },
            },
        });

        const formattedSettings = allSettings.map((setting) => ({
            ...setting,
            settings: JSON.parse(setting.settings),
        }));

        res.json(formattedSettings);
    } catch (error) {
        console.error("Get all settings error:", error);
        res.status(500).json({ error: "Failed to get settings" });
    }
};
