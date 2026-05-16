const seedPosts = [
  {
    id: "sample-1",
    title: "駅前で見かけた深い赤",
    category: "Rose",
    body: "帰り道に花屋の前で足が止まった。黒に近い赤の薔薇が静かに目立っていて、今日の記録に残したくなった。",
    date: "2026.05.16",
  },
  {
    id: "sample-2",
    title: "カフェで作業した午後",
    category: "Cafe",
    body: "窓際の席で予定を整理。小さな達成がいくつか積み上がった日。次にやることも少しだけ見えた。",
    date: "2026.05.15",
  },
  {
    id: "sample-3",
    title: "好きなものメモ",
    category: "Daily",
    body: "白黒写真、静かな店、深夜のラジオ、余白のあるデザイン。今の気分をまとめるとだいたいこのあたり。",
    date: "2026.05.14",
  },
];

const storageKey = "monochrome-days-posts";
const postGrid = document.querySelector("#post-grid");
const postForm = document.querySelector("#post-form");
const currentDate = document.querySelector("#current-date");
const filterButtons = [...document.querySelectorAll(".filter")];

let activeFilter = "All";
let posts = loadPosts();

function loadPosts() {
  const savedPosts = readStoredPosts();

  if (!savedPosts) {
    return seedPosts;
  }

  try {
    const parsedPosts = JSON.parse(savedPosts);
    return Array.isArray(parsedPosts) ? parsedPosts : seedPosts;
  } catch {
    return seedPosts;
  }
}

function savePosts() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(posts));
  } catch {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(posts));
    } catch {
      return;
    }
  }
}

function readStoredPosts() {
  try {
    return localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey);
  } catch {
    try {
      return sessionStorage.getItem(storageKey);
    } catch {
      return null;
    }
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
          <p>このカテゴリの記録を追加すると、ここに表示されます。</p>
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
          <span>${post.category}</span>
          <time datetime="${post.date.replaceAll(".", "-")}">${post.date}</time>
        </div>
        <h3>${escapeHtml(post.title)}</h3>
        <p>${escapeHtml(post.body)}</p>
        <button class="delete-post" type="button" data-id="${post.id}">削除</button>
      </div>
    `;
    postGrid.append(card);
  });
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

postForm.addEventListener("submit", (event) => {
  event.preventDefault();
  event.stopPropagation();

  const formData = new FormData(postForm);
  const post = {
    id: createPostId(),
    title: formData.get("title").trim(),
    category: formData.get("category"),
    body: formData.get("body").trim(),
    date: formatDate(),
  };

  posts = [post, ...posts];
  savePosts();
  postForm.reset();
  renderPosts();
  document.querySelector("#logs").scrollIntoView({ behavior: "smooth" });
});

function createPostId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `post-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

postGrid.addEventListener("click", (event) => {
  const deleteButton = event.target.closest(".delete-post");

  if (!deleteButton) {
    return;
  }

  posts = posts.filter((post) => post.id !== deleteButton.dataset.id);
  savePosts();
  renderPosts();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    renderPosts();
  });
});

currentDate.textContent = formatDate();
renderPosts();
