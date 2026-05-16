const postForm = document.querySelector("#post-form");
const dateInput = document.querySelector("#post-date");
const imageInput = document.querySelector("#post-image");
const imagePreview = document.querySelector("#image-preview");
const imagePreviewImg = document.querySelector("#image-preview-img");
const downloadPanel = document.querySelector("#download-panel");
const downloadStatus = document.querySelector("#download-status");
const downloadLink = document.querySelector("#download-link");

let currentPosts = [];
let downloadUrl = "";
let selectedImageData = "";

async function loadCurrentPosts() {
  try {
    const response = await fetch("posts.json", { cache: "no-store" });

    if (!response.ok) {
      return [];
    }

    const posts = await response.json();
    return Array.isArray(posts) ? posts : [];
  } catch {
    return [];
  }
}

function todayValue() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function displayDate(value) {
  return value.replaceAll("-", ".");
}

function postId(date, title) {
  const safeTitle = title
    .toLowerCase()
    .replaceAll(/\s+/g, "-")
    .replaceAll(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "");
  return `${date}-${safeTitle || Date.now()}`;
}

function createDownload(posts) {
  if (downloadUrl) {
    URL.revokeObjectURL(downloadUrl);
  }

  const json = `${JSON.stringify(posts, null, 2)}\n`;
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  downloadUrl = URL.createObjectURL(blob);
  downloadLink.href = downloadUrl;
  downloadPanel.hidden = false;
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(new Error("写真を読み込めませんでした。")));
    reader.readAsDataURL(file);
  });
}

function imageFromDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("写真を表示できませんでした。")));
    image.src = dataUrl;
  });
}

async function compressImage(file) {
  const dataUrl = await loadImage(file);
  const image = await imageFromDataUrl(dataUrl);
  const maxSide = 1400;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", 0.82);
}

imageInput.addEventListener("change", async () => {
  selectedImageData = "";
  imagePreview.hidden = true;
  imagePreviewImg.removeAttribute("src");

  const file = imageInput.files?.[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    downloadStatus.textContent = "画像ファイルを選んでください。";
    return;
  }

  selectedImageData = await compressImage(file);
  imagePreviewImg.src = selectedImageData;
  imagePreview.hidden = false;
});

postForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(postForm);
  const title = formData.get("title").trim();
  const date = formData.get("date");
  const newPost = {
    id: postId(date, title),
    title,
    category: formData.get("category"),
    body: formData.get("body").trim(),
    date: displayDate(date),
  };

  if (selectedImageData) {
    newPost.image = selectedImageData;
  }

  const nextPosts = [newPost, ...currentPosts.filter((post) => post.id !== newPost.id)];
  createDownload(nextPosts);
  downloadStatus.textContent = `新しい記事「${title}」を追加したposts.jsonを作成しました。`;
});

async function init() {
  dateInput.value = todayValue();
  currentPosts = await loadCurrentPosts();
}

init();
