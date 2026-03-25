import type { Request, Response } from "express";
import multer from "multer";
import { uploadService } from "../services/upload.service.ts";

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
