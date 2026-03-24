# Avator upload

## Support local preview

```js
  inpFile.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      // local preview
      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  };
```

## Support  clip
