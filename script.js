const fallbackPosts = [];
const fallbackProfile = {
  title: "About this site",
  copy: "薔薇が好きな気持ちと、日常の断片を集める私用ホームページです。活動ログ、アーカイブ、プロフィールを少しずつ育てていけます。",
  theme: "Rose / Monochrome / Chic / Fan site",
  updated: "気が向いた日",
  links: "Instagram / X / YouTube",
};

const postGrid = document.querySelector("#post-grid");
const latestPost = document.querySelector("#latest-post");
const currentDate = document.querySelector("#current-date");
const filterButtons = [...document.querySelectorAll(".filter")];
const profileTitle = document.querySelector("#profile-title");
const profileCopy = document.querySelector("#profile-copy");
const profileTheme = document.querySelector("#profile-theme");
const profileUpdated = document.querySelector("#profile-updated");
const profileLinks = document.querySelector("#profile-links");
const ownerLink = document.querySelector("#owner-link");

let activeFilter = "All";
let posts = [];

async function loadPosts() {
  try {
    const response = await fetch("posts.json", { cache: "no-store" });

    if (!response.ok) {
      return fallbackPosts;
    }

    const loadedPosts = await response.json();
    return normalizePosts(loadedPosts);
  } catch {
    return fallbackPosts;
  }
}

function normalizePosts(loadedPosts) {
  if (!Array.isArray(loadedPosts)) {
    return fallbackPosts;
  }

  const validPosts = loadedPosts.filter(
    (post) => post.id && post.title && post.category && post.body && post.date,
  );

  return validPosts.length > 0 ? validPosts : fallbackPosts;
}

async function loadProfile() {
  try {
    const response = await fetch("profile.json", { cache: "no-store" });

    if (!response.ok) {
      return fallbackProfile;
    }

    const profile = await response.json();
    return { ...fallbackProfile, ...profile };
  } catch {
    return fallbackProfile;
  }
}

function formatDate(date = new Date()) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replaceAll("/", ".");
}

function renderLatestPost() {
  const post = posts[0];

  if (!post) {
    latestPost.innerHTML = `
      <div class="post-meta"><span>Empty</span><span>${formatDate()}</span></div>
      <h3>まだ投稿がありません</h3>
      <p>最初の活動ログを追加すると、ここに表示されます。</p>
    `;
    return;
  }

  latestPost.innerHTML = `
    ${post.image ? `<div class="featured-media">${postImage(post)}</div>` : ""}
    <div class="post-meta">
      <span>${escapeHtml(post.category)}</span>
      <time datetime="${dateTimeValue(post.date)}">${escapeHtml(post.date)}</time>
    </div>
    <h3>${escapeHtml(post.title)}</h3>
    <p>${escapeHtml(post.body)}</p>
  `;
}

function renderProfile(profile) {
  profileTitle.textContent = profile.title || fallbackProfile.title;
  profileCopy.textContent = profile.copy || fallbackProfile.copy;
  profileTheme.textContent = profile.theme || fallbackProfile.theme;
  profileUpdated.textContent = profile.updated || fallbackProfile.updated;
  profileLinks.textContent = profile.links || fallbackProfile.links;
}

function renderPosts() {
  const visiblePosts =
    activeFilter === "All"
      ? posts
      : posts.filter((post) => post.category === activeFilter);

  postGrid.innerHTML = "";

  if (visiblePosts.length === 0) {
    postGrid.innerHTML = `
      <article class="post-card">
        <div class="post-art"></div>
        <div class="post-content">
          <div class="post-meta"><span>Empty</span><span>${activeFilter}</span></div>
          <h3>まだ投稿がありません</h3>
          <p>このカテゴリの活動ログを追加すると、ここに表示されます。</p>
        </div>
      </article>
    `;
    return;
  }

  visiblePosts.forEach((post) => {
    const card = document.createElement("article");
    card.className = "post-card";
    card.innerHTML = `
      <div class="post-art">${post.image ? postImage(post) : ""}</div>
      <div class="post-content">
        <div class="post-meta">
          <span>${escapeHtml(post.category)}</span>
          <time datetime="${dateTimeValue(post.date)}">${escapeHtml(post.date)}</time>
        </div>
        <h3>${escapeHtml(post.title)}</h3>
        <p>${escapeHtml(post.body)}</p>
      </div>
    `;
    postGrid.append(card);
  });
}

function postImage(post) {
  return `<img src="${escapeAttribute(post.image)}" alt="${escapeAttribute(post.title)}" loading="lazy" />`;
}

function dateTimeValue(date) {
  return date.replaceAll(".", "-");
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(text) {
  return escapeHtml(text).replaceAll("`", "&#096;");
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    renderPosts();
  });
});

function setupOwnerMode() {
  const params = new URLSearchParams(window.location.search);

  if (params.get("owner") === "1") {
    localStorage.setItem("rose-owner-mode", "on");
  }

  if (params.get("owner") === "0") {
    localStorage.removeItem("rose-owner-mode");
  }

  if (ownerLink && localStorage.getItem("rose-owner-mode") === "on") {
    ownerLink.hidden = false;
  }
}

async function init() {
  setupOwnerMode();
  currentDate.textContent = formatDate();
  const [loadedPosts, profile] = await Promise.all([loadPosts(), loadProfile()]);
  posts = loadedPosts;
  renderProfile(profile);
  renderLatestPost();
  renderPosts();
}

init();
