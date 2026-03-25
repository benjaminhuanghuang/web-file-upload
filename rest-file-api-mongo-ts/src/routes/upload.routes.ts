import { Router } from "express";
import {
  uploadHandler,
  uploadToS3Handler,
  uploadBase64MongoHandler,
} from "../controllers/upload.controller.ts";

const router = Router();

router.post("/upload", uploadHandler);
router.post("/upload/base64/mongo", uploadBase64MongoHandler);
// S3 storage
router.post("/upload/s3", uploadToS3Handler);

export default router;
