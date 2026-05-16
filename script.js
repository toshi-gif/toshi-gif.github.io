const fallbackPosts = [
  {
    id: "rose-2026-05-16",
    title: "駅前で見かけた深い赤",
    category: "Rose",
    body: "帰り道に花屋の前で足が止まった。黒に近い赤の薔薇が静かに目立っていて、今日の記録に残したくなった。",
    date: "2026.05.16",
  },
  {
    id: "cafe-2026-05-15",
    title: "カフェで作業した午後",
    category: "Cafe",
    body: "窓際の席で予定を整理。小さな達成がいくつか積み上がった日。次にやることも少しだけ見えた。",
    date: "2026.05.15",
  },
  {
    id: "daily-2026-05-14",
    title: "好きなものメモ",
    category: "Daily",
    body: "白黒写真、静かな店、深夜のラジオ、余白のあるデザイン。今の気分をまとめるとだいたいこのあたり。",
    date: "2026.05.14",
  },
];

const postGrid = document.querySelector("#post-grid");
const latestPost = document.querySelector("#latest-post");
const currentDate = document.querySelector("#current-date");
const filterButtons = [...document.querySelectorAll(".filter")];

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
    <div class="post-meta">
      <span>${escapeHtml(post.category)}</span>
      <time datetime="${dateTimeValue(post.date)}">${escapeHtml(post.date)}</time>
    </div>
    <h3>${escapeHtml(post.title)}</h3>
    <p>${escapeHtml(post.body)}</p>
  `;
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
      <div class="post-art"></div>
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

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    renderPosts();
  });
});

async function init() {
  currentDate.textContent = formatDate();
  posts = await loadPosts();
  renderLatestPost();
  renderPosts();
}

init();
