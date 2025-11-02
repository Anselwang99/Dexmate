import prisma from "../config/database.js";
import { hashPassword, comparePassword, generateToken } from "../utils/auth.js";

export const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res
                .status(400)
                .json({ error: "Email, password, and name are required" });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        const hashedPassword = await hashPassword(password);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, name },
            select: { id: true, email: true, name: true, createdAt: true },
        });

        const token = generateToken(user.id);
        res.status(201).json({ user, token });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Failed to register user" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ error: "Email and password are required" });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isValidPassword = await comparePassword(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = generateToken(user.id);
        const { password: _, ...userWithoutPassword } = user;

        res.json({ user: userWithoutPassword, token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Failed to login" });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, email: true, name: true, createdAt: true },
        });
        res.json(user);
    } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({ error: "Failed to get user" });
    }
};
