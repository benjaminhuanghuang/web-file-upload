const $ = document.querySelector.bind(document);

const doms = {
  img: $(".preview"),
  container: $(".upload"),
  select: $(".upload-select"),
  selectFile: $(".upload-select input"),
  progress: $(".upload-progress"),
  cancelBtn: $(".upload-progress button"),
  delBtn: $(".upload-result button"),
};

console.log(doms);

function showArea(areaName) {
  doms.container.className = `upload ${areaName}`;
}

function setProgress(value) {
  doms.progress.style.setProperty("--percent", value);
}

// show file browser
doms.select.onclick = function () {
  doms.selectFile.click();
};

let cancelUpload = null;
function cancel() {
  if (cancelUpload) {
    cancelUpload();
    cancelUpload = null;
    showArea("select");
    doms.selectFile.value = null;
  }
}

doms.cancelBtn.onclick = doms.delBtn.onclick = cancel;

doms.selectFile.onchange = function () {
  if (this.files.length === 0) {
    return;
  }
  const file = this.files[0];
  if (!validateFile(file)) {
    return;
  }
  showArea("progress");

  // preview
  const reader = new FileReader();
  reader.onload = function (e) {
    doms.img.src = e.target.result;
  };
  reader.readAsDataURL(file);

  // upload
  cancelUpload = upload(
    file,
    function (value) {
      // onProgress
      setProgress(value);
    },
    function () {
      // onFinish
      showArea("result");
    }
  );
};

function validateFile(file) {
  const validTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!validTypes.includes(file.type)) {
    alert("Please select a valid image file (JPEG, PNG, GIF).");
    return false;
  }
  const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSizeInBytes) {
    alert("File size exceeds the maximum limit of 5MB.");
    return false;
  }
  return true;
}

function upload(file, onProgress, onFinish) {
  // cancel function
  return function () {};
}

function upload_mock(file, onProgress, onFinish) {
  let p = 0;
  onProgress(p);
  const timerId = setInterval(() => {
    p++;
    onProgress(p);
    if (p === 100) {
      onFinish("done");
      clearInterval(timerId);
    }
  }, 50);

  // cancel function
  return function () {
    clearInterval(timerId);
  };
}
