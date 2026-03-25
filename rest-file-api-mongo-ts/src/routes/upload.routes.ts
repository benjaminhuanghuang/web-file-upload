import { Router } from "express";
import { uploadHandler } from "../controllers/upload.controller.ts";

const router = Router();

router.post("/single", uploadHandler);
router.put("/base64", uploadHandler);
router.delete("/binary", uploadHandler);

export default router;
