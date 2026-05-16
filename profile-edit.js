const profileForm = document.querySelector("#profile-form");
const profileDownloadPanel = document.querySelector("#profile-download-panel");
const profileDownloadStatus = document.querySelector("#profile-download-status");
const profileDownloadLink = document.querySelector("#profile-download-link");

let profileDownloadUrl = "";

const defaultProfile = {
  title: "About this site",
  copy: "薔薇が好きな気持ちと、日常の断片を集める私用ホームページです。活動ログ、アーカイブ、プロフィールを少しずつ育てていけます。",
  theme: "Rose / Monochrome / Chic / Fan site",
  updated: "気が向いた日",
  links: "Instagram / X / YouTube",
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
  const profile = await loadCurrentProfile();
  fillProfileForm(profile);
}

init();
