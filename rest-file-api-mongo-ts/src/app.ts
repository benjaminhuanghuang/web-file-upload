import express from "express";
import multer from "multer";

import uploadRouter from "./routes/upload.routes.ts";

const app = express();
// Middleware to parse JSON bodies, for base64 uploads, with a size limit to prevent abuse
app.use(express.json({ limit: "10mb" }));

// for multer multipart
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Routes
app.use("/api", uploadRouter);

export default app;
