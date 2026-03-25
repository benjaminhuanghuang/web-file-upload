import type { Request, Response } from "express";
import multer from "multer";
import { uploadService } from "../services/upload.service.ts";
import fs from "fs";

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Unified upload handler
export const uploadHandler = async (req: Request, res: Response) => {
  const contentType = req.headers["content-type"] || "";

  try {
    // multipart
    if (contentType.includes("multipart/form-data")) {
      return handleMultipart(req, res);
    }

    // base64 JSON
    if (contentType.includes("application/json")) {
      return handleBase64(req, res);
    }

    // binary stream
    if (contentType.includes("application/octet-stream")) {
      return handleBinary(req, res);
    }

    return res.status(400).json({ error: "Unsupported Content-Type" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Upload failed" });
  }
};

export const uploadBase64MongoHandler = async (req: Request, res: Response) => {
  const { file, filename = "file.png" } = req.body;
  if (!file) return res.status(400).json({ error: "No file provided" });

  try {
    const result = await uploadService.saveBase64ToMongo(file, filename);
    res.json({
      id: result._id,
      filename: result.filename,
      createdAt: result.createdAt,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const uploadToS3Handler = async (req: Request, res: Response) => {
  const contentType = req.headers["content-type"] || "";

  try {
    // multipart → upload to s3
    if (contentType.includes("multipart/form-data")) {
      upload.single("file")(req, res, async (err: any) => {
        if (err) return res.status(500).json({ error: err.message });
        const file = req.file!;
        const result = await uploadService.uploadToS3(
          fs.createReadStream(file.path),
          file.originalname,
          file.mimetype
        );
        res.json(result);
      });
      return;
    }

    // base64 → upload to s3
    if (contentType.includes("application/json")) {
      const { file, filename = "file.png" } = req.body;
      if (!file) return res.status(400).json({ error: "No file provided" });
      const buffer = Buffer.from(
        file.replace(/^data:.+;base64,/, ""),
        "base64"
      );
      const result = await uploadService.uploadToS3(buffer, filename);
      return res.json(result);
    }

    // binary → upload to s3
    if (contentType.includes("application/octet-stream")) {
      const filename = (req.headers["x-filename"] as string) || "file.bin";
      const result = await uploadService.uploadToS3(req, filename);
      return res.json(result);
    }

    return res.status(400).json({ error: "Unsupported Content-Type" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Handlers
const handleMultipart = (req: Request, res: Response) => {
  upload.single("file")(req, res, (err: any) => {
    if (err) return res.status(500).json({ error: err.message });
    const file = req.file!;
    const result = uploadService.saveMultipart(file);
    res.json(result);
  });
};

const handleBase64 = (req: Request, res: Response) => {
  const { file, filename = "file.png" } = req.body;
  if (!file) return res.status(400).json({ error: "No file provided" });
  const result = uploadService.saveBase64(file, filename);
  res.json(result);
};

const handleBinary = async (req: Request, res: Response) => {
  const filename = (req.headers["x-filename"] as string) || "file.bin";
  try {
    const result = await uploadService.saveBinary(req, filename);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
