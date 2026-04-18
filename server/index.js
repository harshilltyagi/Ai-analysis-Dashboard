import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();

/* CORS */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://ai-analysis-dashboard-one.vercel.app/",
    ],
    credentials: true,
  }),
);

app.use(express.json());

/* Health check */
app.get("/", (req, res) => {
  res.status(200).send("API running");
});

/* Public routes */
app.use("/api/auth", authRoutes);

/* Protected routes */
app.use("/api/ai", authMiddleware, aiRoutes);

app.get("/api/protected", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "Protected route working",
    user: req.user,
  });
});

const PORT = process.env.PORT || 4000;

/* Mongo connect */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Mongo connection error:", error.message);
  });
