# Single file upload

```html
<div class="upload select">
    <div class="upload-select"></div>
    <div class="upload-progress"></div>
    <div class="upload-result"></div>
    <img src="" alt class="preview"/>
</div>
```

通过设置 contain 的 css 来 show/hide 各个子div

## Support drag drop

Approach 1: input 本身支持 drop file on it

```css
.upload-select input {
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
```

Approach 2: drop on div

```css

   
```

```js
doms.select.ondragenter = (e) => {
  e.preventDefault();
};
doms.select.ondragover = (e) => {
  e.preventDefault();
};
doms.select.ondrop = e => {
  e.preventDefault();
  doms.selectFile.files = e.dataTransfer.files;
  doms.selectFile.onchange();
}
```
