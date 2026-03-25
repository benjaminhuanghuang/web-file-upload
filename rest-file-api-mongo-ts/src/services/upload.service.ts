import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { type IFile, FileModel } from "../models/File.ts";

const UPLOAD_DIR = path.join(__dirname, "../uploads");

// Ensure uploads folder exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export interface UploadResult {
  type: "multipart" | "base64" | "binary" | "s3";
  originalName?: string;
  storedName: string;
  path?: string; // local path
  url?: string; // S3 URL
}

export class UploadService {
  /**
   * Save a multipart file (from multer)
   */
  saveMultipart(file: Express.Multer.File): UploadResult {
    return {
      type: "multipart",
      originalName: file.originalname,
      storedName: file.filename,
      path: file.path,
    };
  }

  /**
   * Save a base64 string to a file
   */
  saveBase64(base64: string, filename: string): UploadResult {
    const base64Data = base64.replace(/^data:.+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const safeName = `${Date.now()}-${filename}`;
    const filepath = path.join(UPLOAD_DIR, safeName);

    fs.writeFileSync(filepath, buffer);

    return {
      type: "base64",
      storedName: safeName,
      path: filepath,
    };
  }

  /**
   * Save binary stream to a file
   */
  saveBinary(stream: Readable, filename: string): Promise<UploadResult> {
    const safeName = `${Date.now()}-${filename}`;
    const filepath = path.join(UPLOAD_DIR, safeName);

    return new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(filepath);
      stream.pipe(writeStream);

      stream.on("error", (err) => reject(err));
      writeStream.on("finish", () => {
        resolve({
          type: "binary",
          storedName: safeName,
          path: filepath,
        });
      });
      writeStream.on("error", (err) => reject(err));
    });
  }

  /**
   * Optional: validate file type
   */
  validateMime(
    mime: string,
    allowed: string[] = ["image/png", "image/jpeg", "application/pdf"]
  ): void {
    if (!allowed.includes(mime)) {
      throw new Error(`Unsupported MIME type: ${mime}`);
    }
  }

  async uploadToS3(
    data: Buffer | Readable,
    filename: string,
    mimeType = "application/octet-stream"
  ): Promise<UploadResult> {
    const safeName = `${Date.now()}-${filename}`;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: safeName,
      Body: data,
      ContentType: mimeType,
    };

    await s3Client.send(new PutObjectCommand(params));

    const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${safeName}`;

    return { type: "s3", storedName: safeName, url };
  }

  /**
   *
   * @param base64
   * @param filename
   * @param mimeType
   * @returns
   */
  async saveBase64ToMongo(base64: string, filename: string): Promise<IFile> {
    // Remove possible data URL prefix
    const base64Data = base64.replace(/^data:.+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Save to MongoDB
    const fileDoc = new FileModel({
      filename,
      data: buffer,
    });

    await fileDoc.save();
    return fileDoc;
  }
}

export const uploadService = new UploadService();
