# Ali cloud

- select multi file and folder
- drag drop file and folder
- file list

## Support multi file

```html
<input type="file" multiple/>
```

## Support folder

```html
<input type="file" webkitdirectory mozdirectory odirectory/>
```

## Support folder drag drop

```js
<body>
  <div class="container"></div>
  <script>
    const div = document.querySelector('.container');

    div.ondragenter = (e) => {
      e.preventDefault();
    };

    div.ondragover = (e) => {
      e.preventDefault();
    };
    
    div.ondrop = (e) => {
      e.preventDefault();
      console.log(e.dataTransfer.items);
      for(const item of e.dataTransfer.items) {
        const entry = item.webkitGetAsEntry()
        if(entry.isDirectory) {
          const reader = entry.createReader();
          reader.readEntries((e) => {

          })
        }
        else {
 
        }
      }
    };
  </script>
</body>
```

## Multi file upload
