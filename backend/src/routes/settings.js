import express from "express";
import {
    saveSettings,
    getSettings,
    getAllSettings,
} from "../controllers/settingsController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getAllSettings);
router.post("/:serialNumber", saveSettings);
router.get("/:serialNumber", getSettings);

export default router;
