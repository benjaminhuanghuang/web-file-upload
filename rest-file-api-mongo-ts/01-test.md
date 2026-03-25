# Test

```sh
## multipart
curl -F "file=@test.png" http://localhost:3000/upload


## base64
curl -X POST http://localhost:3000/upload \
  -H "Content-Type: application/json" \
  -d '{"file":"data:image/png;base64,xxxx","filename":"a.png"}'

## binary
curl -X POST http://localhost:3000/upload \
  -H "Content-Type: application/octet-stream" \
  -H "x-filename: test.bin" \
  --data-binary "@test.bin"
```
