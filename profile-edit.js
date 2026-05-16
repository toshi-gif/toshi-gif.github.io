const profileForm = document.querySelector("#profile-form");
const profileDownloadPanel = document.querySelector("#profile-download-panel");
const profileDownloadStatus = document.querySelector("#profile-download-status");
const profileDownloadLink = document.querySelector("#profile-download-link");
const profileImageInput = document.querySelector("#profile-image-input");
const profileImagePreview = document.querySelector("#profile-image-preview");
const profileImagePreviewImg = document.querySelector("#profile-image-preview-img");

let profileDownloadUrl = "";
let selectedProfileImage = "";

const defaultProfile = {
  title: "About this site",
  copy: "薔薇が好きな気持ちと、日常の断片を集める私用ホームページです。活動ログ、アーカイブ、プロフィールを少しずつ育てていけます。",
  theme: "Rose / Monochrome / Chic / Fan site",
  updated: "気が向いた日",
  links: "Instagram / X / YouTube",
  image: "",
};

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
  const maxSide = 1200;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", 0.84);
}

function showProfileImagePreview(imageData) {
  if (!imageData) {
    profileImagePreview.hidden = true;
    profileImagePreviewImg.removeAttribute("src");
    return;
  }

  profileImagePreviewImg.src = imageData;
  profileImagePreview.hidden = false;
}

profileImageInput.addEventListener("change", async () => {
  const file = profileImageInput.files?.[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    profileDownloadStatus.textContent = "画像ファイルを選んでください。";
    return;
  }

  selectedProfileImage = await compressImage(file);
  showProfileImagePreview(selectedProfileImage);
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
    image: selectedProfileImage,
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
  selectedProfileImage = profile.image || "";
  showProfileImagePreview(selectedProfileImage);
}

async function init() {
  const profile = await loadCurrentProfile();
  fillProfileForm(profile);
}

init();
