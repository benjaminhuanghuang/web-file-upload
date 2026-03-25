# Big file

使用 MongoDB 记录上传状态

```js
interface UploadSession {
  fileId: string;        // 文件唯一标识
  filename: string;
  totalChunks: number;
  uploadedChunks: number[];
  mimeType: string;
  complete: boolean;
}
```

| 接口                       | 方法   | 功能                                      |
| ------------------------ | ---- | --------------------------------------- |
| `/upload/init`           | POST | 初始化上传，返回 fileId                         |
| `/upload/chunk`          | POST | 上传单片，包含 fileId + chunkIndex + chunkData |
| `/upload/status/:fileId` | GET  | 查询已上传的块 → 断点续传                          |
| `/upload/complete`       | POST | 所有块上传完成 → 合并生成最终文件                      |

```js
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

export const initUpload = async (req: Request, res: Response) => {
  const { filename, totalChunks, mimeType } = req.body;
  const fileId = uuidv4();

  await UploadSessionModel.create({
    fileId,
    filename,
    totalChunks,
    uploadedChunks: [],
    mimeType,
    complete: false,
  });

  res.json({ fileId });
};

export const uploadChunk = async (req: Request, res: Response) => {
  const { fileId, chunkIndex } = req.body;
  const chunk = req.file!.buffer; // Multer memoryStorage

  const chunkPath = path.join("uploads/tmp", `${fileId}_${chunkIndex}`);
  fs.writeFileSync(chunkPath, chunk);

  // 更新上传记录
  const session = await UploadSessionModel.findOne({ fileId });
  session.uploadedChunks.push(Number(chunkIndex));
  await session.save();

  res.json({ status: "ok", uploadedChunks: session.uploadedChunks });
};

export const uploadStatus = async (req: Request, res: Response) => {
  const { fileId } = req.params;
  const session = await UploadSessionModel.findOne({ fileId });
  if (!session) return res.status(404).json({ error: "Not found" });

  res.json({
    uploadedChunks: session.uploadedChunks,
    totalChunks: session.totalChunks,
    progress: (session.uploadedChunks.length / session.totalChunks) * 100,
  });
};
export const completeUpload = async (req: Request, res: Response) => {
  const { fileId } = req.body;
  const session = await UploadSessionModel.findOne({ fileId });
  if (!session) return res.status(404).json({ error: "Not found" });

  const finalPath = path.join("uploads", session.filename);
  const writeStream = fs.createWriteStream(finalPath);

  for (let i = 0; i < session.totalChunks; i++) {
    const chunkPath = path.join("uploads/tmp", `${fileId}_${i}`);
    const chunkData = fs.readFileSync(chunkPath);
    writeStream.write(chunkData);
    fs.unlinkSync(chunkPath); // 删除临时片
  }

  writeStream.end();
  session.complete = true;
  await session.save();

  res.json({ status: "complete", filePath: finalPath });
};
```

## Front end

```js
const chunkSize = 1024 * 1024; // 1MB
const totalChunks = Math.ceil(file.size / chunkSize);

for (let i = 0; i < totalChunks; i++) {
  const chunk = file.slice(i * chunkSize, (i + 1) * chunkSize);
  const formData = new FormData();
  formData.append("chunk", chunk);
  formData.append("fileId", fileId);
  formData.append("chunkIndex", i);

  await fetch("/upload/chunk", { method: "POST", body: formData });
}

// Progress
const progress = (uploadedChunks.length / totalChunks) * 100;
```

断点续传： 上传前先调用 /upload/status/:fileId, 只上传未完成的块
