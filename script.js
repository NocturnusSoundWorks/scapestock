// ==========================
// LICENSE
// ==========================
function getLicense(photo) {
  if (photo.license) return photo.license;

  const editorialTags = ["shrine", "temple"];
  const tags = photo.tags || [];

  if (tags.some(t => editorialTags.includes(t))) return "editorial";
  return "commercial";
}

// ==========================
// SEO
// ==========================
function generateDescription(photo) {
  if (photo.title) {
    return `${photo.title}. Free high-resolution stock photo from ScapeStock.`;
  }
  return (photo.tags || []).slice(0, 6).join(", ") +
    ". Free high-resolution stock photo from ScapeStock.";
}

function generateTitle(photo) {
  if (photo.title) return `${photo.title} | ScapeStock`;
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
const MAX_LOAD = 200;

let page = 1;
let list = [];
let loading = false;

// ==========================
// GALLERY
// ==========================
function initGallery() {
  const el = document.getElementById("gallery");
  if (!el) return;

  const params = new URLSearchParams(location.search);
  const tag = params.get("tag");
  const search = params.get("search");

  list = shuffle(PHOTOS);

  if (tag) list = list.filter(p => (p.tags || []).includes(tag));

  if (search) {
    const words = search.toLowerCase().split(" ").filter(Boolean);
    list = list.filter(p =>
      words.every(w =>
        (p.tags || []).map(t => t.toLowerCase()).includes(w)
      )
    );
  }

  loadMore();
  createLoadMoreButton();
}

// ==========================
// LOAD MORE
// ==========================
function loadMore() {
  const el = document.getElementById("gallery");
  if (!el) return;

  const slice = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  slice.forEach(p => {
    const a = document.createElement("a");
    a.href = `photo.html?id=${p.id}`;
    a.className = "photo-card";

    const img = document.createElement("img");
    const folder = p.folder ? p.folder.replace("full", "thu") : "thu01";
    img.src = `images/${folder}/${p.id}_thu.jpg`;
    img.alt = generateTitle(p);
    img.loading = "lazy";

    const lic = document.createElement("p");
    lic.className = "license";
    lic.textContent = getLicense(p);

    a.appendChild(img);
    a.appendChild(lic);
    el.appendChild(a);
  });

  page++;
}

// ==========================
// LOAD MORE BUTTON
// ==========================
function createLoadMoreButton() {
  const btn = document.createElement("div");
  btn.textContent = "Load More";
  btn.style.textAlign = "center";
  btn.style.cursor = "pointer";
  btn.style.margin = "40px 0";

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
  lic.className = "license";
  lic.textContent = getLicense(photo);

  const dl = document.createElement("a");
  dl.href = img.src;
  dl.download = photo.id;
  dl.textContent = "Download";
  dl.className = "download-btn";

  box.appendChild(img);
  box.appendChild(lic);
  box.appendChild(dl);

  // TAGS
  const tagBox = document.getElementById("photo-tags");
  if (tagBox) {
    tagBox.innerHTML = "";
    (photo.tags || []).slice(0, 8).forEach(t => {
      const a = document.createElement("a");
      a.href = `index.html?tag=${t}`;
      a.textContent = t.replace(/-/g, " ");
      a.className = "tag-button";
      tagBox.appendChild(a);
    });
  }

  // SEO
  document.title = generateTitle(photo);

  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", generateDescription(photo));

  const canonical = document.getElementById("canonical");
  if (canonical) {
    canonical.href = `https://www.scapestock.net/photo.html?id=${photo.id}`;
  }
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
// GRID
// ==========================
function resizeGrid() {
  const grid = document.querySelector(".gallery");
  if (!grid) return;

  const row = parseInt(getComputedStyle(grid).gridAutoRows);
  const gap = parseInt(getComputedStyle(grid).gap);

  grid.querySelectorAll("a").forEach(a => {
    const img = a.querySelector("img");
    if (!img) return;

    const h = img.getBoundingClientRect().height;
    const span = Math.ceil((h + gap) / (row + gap));
    a.style.gridRowEnd = `span ${span}`;
  });
}

// ==========================
// START
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("gallery")) initGallery();
  if (document.getElementById("photo-page")) loadPhotoPage();
  setupSearch();
});

window.addEventListener("load", resizeGrid);
window.addEventListener("resize", resizeGrid);