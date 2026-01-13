import { Router } from "express";
import { auth } from "../middleware/auth.middleware.js";
import { createGig, getGigs, getGigById } from "../controllers/gig.controller.js";

const router = Router();
router.get("/", getGigs);
router.get("/:id", getGigById);
router.post("/", auth, createGig);

export default router;
