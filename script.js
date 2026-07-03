// ==========================
// LICENSE
// ==========================
function getLicense(photo) {
  if (photo.license) return photo.license;

  const tags = photo.tags || [];
  const editorial = ["shrine", "temple"];

  if (tags.some(t => editorial.includes(t))) return "editorial";

  return "commercial";
}

// ==========================
// SEO
// ==========================
function generateDescription(photo) {
  if (photo.title) {
    return `${photo.title}. Free high-resolution stock photo from ScapeStock.`;
  }

  const tags = (photo.tags || []).slice(0, 6).join(", ");
  return `${tags}. Free high-resolution stock photo from ScapeStock.`;
}

function generateTitle(photo) {
  if (photo.title) {
    return `${photo.title} | ScapeStock`;
  }
  return `Photo ${photo.id} | ScapeStock`;
}

// ==========================
// UTIL
// ==========================
function getPhotoId() {
  return new URLSearchParams(location.search).get("id");
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ==========================
// GLOBAL
// ==========================
const PER_PAGE = 40;
let page = 1;
let list = [];
let loading = false;

// ==========================
// GALLERY
// ==========================
function initGallery() {
  const el = document.getElementById("gallery");
  if (!el) return;

  list = shuffle(PHOTOS);
  loadMore();
  createBtn();
}

function loadMore() {
  const el = document.getElementById("gallery");
  if (!el) return;

  const slice = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  slice.forEach(p => {
    const a = document.createElement("a");
    a.href = `photo.html?id=${p.id}`;

    const img = document.createElement("img");
    const folder = p.folder ? p.folder.replace("full", "thu") : "thu01";
    img.src = `images/${folder}/${p.id}_thu.jpg`;
    img.alt = generateTitle(p);
    img.loading = "lazy";

    const lic = document.createElement("p");
    lic.textContent = getLicense(p);
    lic.className = "license";

    a.appendChild(img);
    a.appendChild(lic);
    el.appendChild(a);
  });

  page++;
}

// ==========================
// BUTTON
// ==========================
function createBtn() {
  const btn = document.createElement("div");
  btn.textContent = "Load More";
  btn.style.textAlign = "center";
  btn.style.cursor = "pointer";

  btn.onclick = () => {
    if (loading) return;
    loading = true;
    loadMore();
    loading = false;
  };

  document.getElementById("gallery")?.after(btn);
}

// ==========================
// PHOTO PAGE
// ==========================
function loadPhotoPage() {
  const box = document.getElementById("photo-page");
  if (!box) return;

  const id = getPhotoId();
  const photo = PHOTOS.find(p => p.id === id);
  if (!photo) return;

  const img = document.createElement("img");
  img.src = `images/${photo.folder || "full01"}/${photo.id}.jpg`;
  img.alt = generateTitle(photo);

  const lic = document.createElement("p");
  lic.textContent = getLicense(photo);
  lic.className = "license";

  const dl = document.createElement("a");
  dl.href = img.src;
  dl.download = photo.id;
  dl.textContent = "Download";

  box.appendChild(img);
  box.appendChild(lic);
  box.appendChild(dl);

  // TAGS（確実に最後に実行）
  const tagBox = document.getElementById("photo-tags");
  if (tagBox) {
    tagBox.innerHTML = "";
    (photo.tags || []).slice(0, 8).forEach(t => {
      const a = document.createElement("a");
      a.href = `index.html?tag=${t}`;
      a.textContent = t.replace(/-/g, " ");
      tagBox.appendChild(a);
    });
  }

  document.title = generateTitle(photo);
}

// ==========================
// SEARCH
// ==========================
function setupSearch() {
  const form = document.getElementById("search-form");
  if (!form) return;

  form.onsubmit = e => {
    e.preventDefault();
    const q = document.getElementById("search-input").value;
    location.href = `index.html?search=${q}`;
  };
}

// ==========================
// START
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("gallery")) initGallery();
  if (document.getElementById("photo-page")) loadPhotoPage();
  setupSearch();
});