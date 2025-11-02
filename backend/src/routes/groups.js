import express from "express";
import {
    createGroup,
    getGroups,
    getGroup,
    addMember,
    removeMember,
    updateMemberRole,
} from "../controllers/groupController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

router.post("/", createGroup);
router.get("/", getGroups);
router.get("/:id", getGroup);
router.post("/:id/members", addMember);
router.delete("/:id/members/:userId", removeMember);
router.patch("/:id/members/:userId/role", updateMemberRole);

export default router;
