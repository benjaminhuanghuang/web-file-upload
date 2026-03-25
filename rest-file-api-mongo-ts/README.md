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

## Save to S3

## Chunk Upload

## 上传进度 + 断点续传
