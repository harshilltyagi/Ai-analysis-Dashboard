import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API running");
});
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);

app.get("/api/protected", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "Protected route working",
    user: req.user,
  });
});

const PORT = process.env.PORT || 4000;

console.log("URI loaded:", process.env.MONGO_URI);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Mongo connection error:", error.message);
  });
