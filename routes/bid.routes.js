import { Router } from "express";
import { auth } from "../middleware/auth.middleware.js";
import { createBid, getBids, hireBid } from "../controllers/bid.controller.js";

const router = Router();
router.post("/", auth, createBid);
router.get("/:gigId", auth, getBids);
router.patch("/:bidId/hire", auth, hireBid);

export default router;
