# Big file

## Front end create chunks

```js
 function createChunks(file, size) {
    const chunks = [];
    let index = 0;
    while (index < file.size) {
      const chunk = file.slice(index, index + size);
      chunks.push(chunk);
      index += size;
    }
    return chunks;
  }
```
