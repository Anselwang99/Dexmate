import express from "express";
import {
    createRobot,
    getRobots,
    getRobotBySerialNumber,
    grantPermission,
    revokePermission,
    deleteRobot,
} from "../controllers/robotController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

router.post("/", createRobot);
router.get("/", getRobots);
router.get("/:serialNumber", getRobotBySerialNumber);
router.post("/:serialNumber/permissions", grantPermission);
router.delete("/:serialNumber/permissions/:userId", revokePermission);
router.delete("/:serialNumber", deleteRobot);

export default router;
