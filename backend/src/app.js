import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import groupRoutes from "./routes/groups.js";
import robotRoutes from "./routes/robots.js";
import settingsRoutes from "./routes/settings.js";

export const createApp = () => {
    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json());

    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/groups", groupRoutes);
    app.use("/api/robots", robotRoutes);
    app.use("/api/settings", settingsRoutes);

    // Health check
    app.get("/api/health", (req, res) => {
        res.json({ status: "ok", message: "Server is running" });
    });

    // Error handling
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({ error: "Something went wrong!" });
    });

    return app;
};
