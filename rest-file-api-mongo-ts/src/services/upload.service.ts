import fs from "fs";
import path from "path";
import { Readable } from "stream";

const UPLOAD_DIR = path.join(__dirname, "../uploads");

// Ensure uploads folder exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export interface UploadResult {
  type: "multipart" | "base64" | "binary";
  originalName?: string;
  storedName: string;
  path: string;
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
}

export const uploadService = new UploadService();
