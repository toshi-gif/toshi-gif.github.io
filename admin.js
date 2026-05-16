const adminForm = document.querySelector("#admin-form");
const profileForm = document.querySelector("#profile-form");
const dateInput = document.querySelector("#admin-date");
const downloadPanel = document.querySelector("#download-panel");
const downloadStatus = document.querySelector("#download-status");
const downloadLink = document.querySelector("#download-link");
const profileDownloadPanel = document.querySelector("#profile-download-panel");
const profileDownloadStatus = document.querySelector("#profile-download-status");
const profileDownloadLink = document.querySelector("#profile-download-link");

let currentPosts = [];
let downloadUrl = "";
let profileDownloadUrl = "";

const defaultProfile = {
  title: "About this site",
  copy: "薔薇が好きな気持ちと、日常の断片を集める私用ホームページです。活動ログ、アーカイブ、プロフィールを少しずつ育てていけます。",
  theme: "Rose / Monochrome / Chic / Fan site",
  updated: "気が向いた日",
  links: "Instagram / X / YouTube",
};

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

async function loadCurrentProfile() {
  try {
    const response = await fetch("profile.json", { cache: "no-store" });

    if (!response.ok) {
      return defaultProfile;
    }

    const profile = await response.json();
    return { ...defaultProfile, ...profile };
  } catch {
    return defaultProfile;
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

function createProfileDownload(profile) {
  if (profileDownloadUrl) {
    URL.revokeObjectURL(profileDownloadUrl);
  }

  const json = `${JSON.stringify(profile, null, 2)}\n`;
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  profileDownloadUrl = URL.createObjectURL(blob);
  profileDownloadLink.href = profileDownloadUrl;
  profileDownloadPanel.hidden = false;
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

profileForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(profileForm);
  const profile = {
    title: formData.get("title").trim(),
    copy: formData.get("copy").trim(),
    theme: formData.get("theme").trim(),
    updated: formData.get("updated").trim(),
    links: formData.get("links").trim(),
  };

  createProfileDownload(profile);
  profileDownloadStatus.textContent = "新しいプロフィールを入れたprofile.jsonを作成しました。";
});

function fillProfileForm(profile) {
  profileForm.elements.title.value = profile.title;
  profileForm.elements.copy.value = profile.copy;
  profileForm.elements.theme.value = profile.theme;
  profileForm.elements.updated.value = profile.updated;
  profileForm.elements.links.value = profile.links;
}

async function init() {
  dateInput.value = todayValue();
  const [posts, profile] = await Promise.all([loadCurrentPosts(), loadCurrentProfile()]);
  currentPosts = posts;
  fillProfileForm(profile);
}

init();
