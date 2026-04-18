import express from "express";
import {
  generateInitialReport,
  askFollowupQuestion,
} from "../controllers/aiController.js";

const router = express.Router();

router.post("/analyze", generateInitialReport);
router.post("/ask", askFollowupQuestion);

export default router;
