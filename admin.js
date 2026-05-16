const adminForm = document.querySelector("#admin-form");
const dateInput = document.querySelector("#admin-date");
const downloadPanel = document.querySelector("#download-panel");
const downloadStatus = document.querySelector("#download-status");
const downloadLink = document.querySelector("#download-link");

let currentPosts = [];
let downloadUrl = "";

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

adminForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(adminForm);
  const title = formData.get("title").trim();
  const date = formData.get("date");
  const newPost = {
    id: postId(date, title),
    title,
    category: formData.get("category"),
    body: formData.get("body").trim(),
    date: displayDate(date),
  };
  const image = formData.get("image").trim();

  if (image) {
    newPost.image = image;
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
