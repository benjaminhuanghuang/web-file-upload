# web file upload

- Backend
  - file format: binary/base64
  - save as file
  - save in data base
  - save in cloud

- Frontend
  - Preview
  - Clip
  - Progress bar & cancel
  - Multi file
  - Huge file

## API interface design

### Binary

path: /upload/single
method: POST
format: multipart/form-data
field name: avatar
extension list : ['.jpg', '.jpeg', '.bmp', '.webp', '.gif', '.png']
max size: 5M
response format and content: JSON

HTTP request

```http
POST /upload/single HTTP/1.1
HOST: localhost:8080
Content-Type: multipart/form-data; boundary=aaa
Content-Disposition: form-data; name="字段名1"

Alice
------分隔符
Content-Disposition: form-data; name="字段名for file"; filename="a.png"
Content-Type: image/png

(binary data)
--分隔符--
```

### Base64

path: /upload/single
method: POST
format: json
extension list : ['.jpg', '.jpeg', '.bmp', '.webp', '.gif', '.png']
max size: 5M
response format and content: JSON

HTTP request

```http
POST /upload/base64 HTTP/1.1
HOST: localhost:8080
Content-Type: application/json

{
  "name": "golden-gate.png",
  "ext": ".jpg",
  "data": "iVBORw0KGgoAAAANSUhEUgAAAPoAAAD6CAYAAACM..."
}

```

## Front

```html
<form method="POST" enctype="multipart/form-data">
  <input name="name" />
  <input type="file" name="file" />
  <button>Submit</button>
</form>
```

```js
const formData = new FormData();  // set Content-Type and boundary
formData.append("name", "Alice");
formData.append("file", fileInput.files[0]);

fetch("/upload", {
  method: "POST",
  body: formData,
});
```
