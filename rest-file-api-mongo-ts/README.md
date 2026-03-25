# Rest API for file upload

## multipart/form-data

HTTP 请求被拆成多个 part，每个字段一段，文件是其中一段。

### Express + Multer

```js
npm i multer
npm i -D @types/multer
```

## Base64

Suitable for small files, for example, user avatars.

## Binary

```js
req.pipe(fs.createWriteStream("file.bin"));
```

## Save to database

### Multer -> Mongodb

```js
// upload.service.ts
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";

const mongoURI = "mongodb://localhost:27017/mydb";

export const storage = new GridFsStorage({
  url: mongoURI,
  options: { useUnifiedTopology: true },
  file: (req, file) => {
    return {
      filename: `${Date.now()}-${file.originalname}`, // 文件名
      bucketName: "uploads", // GridFS bucket
    };
  },
});

export const upload = multer({ storage });
```

## Save to S3

### Multer -> S3

```js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
class S3Storage {
  _handleFile(req: any, file: any, cb: any) {
    const s3 = new S3Client({ region: "us-east-1" });
    const params = {
      Bucket: "bucket-name",
      Key: Date.now() + "-" + file.originalname,
      Body: file.stream
    };
    s3.send(new PutObjectCommand(params))
      .then(() => cb(null, { key: params.Key }))
      .catch(cb);
  }
  _removeFile(req: any, file: any, cb: any) {
    // 可实现删除 S3 文件
    cb(null);
  }
}

const upload = multer({ storage: new S3Storage() });
```

## Chunk Upload

## 上传进度 + 断点续传
