function getLicense(photo) {

  // ① 手動指定（最優先）
  if (photo.license) {
    return photo.license;
  }

  // ② 自動判定
  const tags = photo.tags || [];

  const autoEditorialTags = ["shrine","temple"];

  if (tags.some(tag => autoEditorialTags.includes(tag))) {
    return "editorial";
  }

  // ③ デフォルト
  return "commercial";
}

// ===== SEO自動生成 =====

// 単語整形
function formatWord(word){
  return word.charAt(0).toUpperCase() + word.slice(1)
}

function generateDescription(photo){

  if(photo.title){
    return `${photo.title}. Free high-resolution stock photo from ScapeStock. Download free images for commercial and personal use.`;
  }

  const tags = photo.tags || [];
  const words = tags.slice(0,6).map(t => t.replace(/-/g," "));
  const text = words.join(", ");

  return `${text}. Free high-resolution stock photo from ScapeStock.`;
}

function generateTitle(photo){

  // 手入力titleを最優先
  if(photo.title){
    return `${photo.title} | Free Japan Stock Photo | ScapeStock`;
  }

  const tags = photo.tags || [];

  const locationTags = ["tokyo","chiba","kyoto","osaka","japan","ginza","nihonbashi","ichikawa"];
  const subjectTags = ["city","cityscape","building","road","street","flower","tree","sky","cloud","temple","shrine"];
  const timeTags = ["night","sunset","daytime","sunny"];

  const location = photo.city || tags.find(t => locationTags.includes(t));
  const subject = tags.find(t => subjectTags.includes(t));
  const time = tags.find(t => timeTags.includes(t));

  const cap = s => s ? s.charAt(0).toUpperCase() + s.replace(/-/g," ").slice(1) : "";

  const subjectText = subject ? cap(subject) : "Photo";
  const locationText = location ? cap(location) + ", Japan" : "Japan";
  const timeText = time ? " at " + cap(time) : "";

  return `${subjectText}${timeText}, ${locationText} | ${photo.id} | Free Stock Photo`;
}

function getPhotoId(){
const params = new URLSearchParams(window.location.search)
return params.get("id")
}




/* --------------------------
   ランダムシャッフル
-------------------------- */

function shuffleArray(array){

const copied=[...array]

for(let i=copied.length-1;i>0;i--){

const j=Math.floor(Math.random()*(i+1))

const temp=copied[i]
copied[i]=copied[j]
copied[j]=temp

}

return copied

}

/* --------------------------
   グローバル変数
-------------------------- */

const PER_PAGE=40
const AUTO_LOAD_LIMIT = 200
let currentPage=1
let shuffledPhotos=[]
let loading=false

/* --------------------------
   ギャラリー初期化
-------------------------- */

function initGallery(){

const gallery=document.getElementById("gallery")
if(!gallery) return

const params=new URLSearchParams(window.location.search)

const tag=params.get("tag")
const search=params.get("search")

/* 写真シャッフル */
shuffledPhotos=shuffleArray(PHOTOS)

/* フィルター */
if(tag){
shuffledPhotos=shuffledPhotos.filter(p=>p.tags.includes(tag))
}

if(search){

const words=search.toLowerCase().split(" ").filter(Boolean)

shuffledPhotos=shuffledPhotos.filter(photo=>
words.every(word=>
photo.tags.map(t=>t.toLowerCase()).includes(word)
)
)

}

/* 最初の40枚表示 */
loadMorePhotos()
createLoadMoreButton()
}

/* --------------------------
   写真追加表示
-------------------------- */

function loadMorePhotos(){

const gallery=document.getElementById("gallery")
if(!gallery) return

const start=(currentPage-1)*PER_PAGE
const end=start+PER_PAGE

const photos=shuffledPhotos.slice(start,end)

photos.forEach(photo=>{

const link=document.createElement("a")
link.href="photo.html?id="+photo.id
link.className="photo-card"  

const img=document.createElement("img")
// 👇 folder情報を元に、thu01, thu02 などを自動で判定します（データがない場合は安全策として thu01 になります）
const thuFolder = photo.folder ? photo.folder.replace("full", "thu") : "thu01";
img.src = "images/" + thuFolder + "/" + photo.id + "_thu.jpg";

img.alt = generateTitle(photo);

img.loading="lazy"

// 👇画像が読み込まれてから高さ計算
img.addEventListener("load", () => {
  resizeGridItems()
})  

// ★追加：ライセンス取得
const license = getLicense(photo)

// ★追加：表示用テキスト
const licenseLabel = document.createElement("p")
licenseLabel.className = "license"
licenseLabel.textContent = license

link.appendChild(img)
link.appendChild(licenseLabel) // ←これ追加

gallery.appendChild(link)

})
  


loading=false
currentPage++
  
// 👇ここから追加
const totalLoaded = currentPage * PER_PAGE
const btn = document.getElementById("load-more-btn")

if(btn){

if(totalLoaded >= 200){
btn.style.display = "block"
}else{
btn.style.display = "none"
}

}
// 👆ここまで追加
}

function createLoadMoreButton(){

const btn = document.createElement("div")
btn.id = "load-more-btn"
btn.textContent = "Load More Photos"

btn.style.textAlign = "center"
btn.style.margin = "40px 0"
btn.style.cursor = "pointer"
btn.style.display = "none"

btn.addEventListener("click",()=>{

if(loading) return

loading = true
loadMorePhotos()

})

document.getElementById("gallery").after(btn)

}
/* --------------------------
   無限スクロール
-------------------------- */

window.addEventListener("scroll",()=>{

if(loading) return

// 👇これを追加（ここが重要）
if(currentPage * PER_PAGE >= 200){
return
}

if(window.innerHeight + window.scrollY >= document.body.offsetHeight - 600){

loading = true
loadMorePhotos()

}

})

/* --------------------------
   写真ページ
-------------------------- */

function loadPhotoPage(){

const photoContainer=document.getElementById("photo-page")

if(!photoContainer) return

const id=getPhotoId()

const photo=PHOTOS.find(p=>p.id===id)

if(!photo) return

const img=document.createElement("img")

img.src = "images/" + (photo.folder || "full01") + "/" + photo.id + ".jpg"

const desc = generateDescription(photo);
const title = generateTitle(photo);

// タイトル（タブ）
document.title = title;

// h1も変更（今は固定なので重要）
const h1 = document.getElementById("page-title");
if(h1){
  h1.textContent = photo.title || "Photo";
}

// description表示
const descEl = document.getElementById("description");
if(descEl){
  descEl.textContent = desc;
}

// meta description
const meta = document.querySelector('meta[name="description"]');
if(meta){
  meta.setAttribute("content", desc);
}
// canonical
const canonical = document.getElementById("canonical");

if(canonical){
  canonical.href =
    "https://www.scapestock.com/photo.html?id=" + photo.id;
}

// alt（SEO重要）
img.alt = title;
  
const download=document.createElement("a")

download.href = "images/" + (photo.folder || "full01") + "/" + photo.id + ".jpg"

download.className="download-btn"

download.download=photo.id+".jpg"

download.innerText="Download"

// ★追加
const license = getLicense(photo)

const licenseLabel = document.createElement("p")
licenseLabel.className = "license"
licenseLabel.textContent = "License: " + license

photoContainer.appendChild(img)
photoContainer.appendChild(licenseLabel) // ←追加
photoContainer.appendChild(download)

// タグ表示
const tagContainer = document.getElementById("photo-tags")

if(tagContainer){

  const tags = (photo.tags || []).slice(0,8)

  tagContainer.innerHTML = "";

  tags.forEach(tag=>{

    const tagBtn = document.createElement("a")

    tagBtn.href = "index.html?tag=" + tag

    tagBtn.className = "tag-button"

    tagBtn.textContent = tag.replace(/-/g," ")

    tagContainer.appendChild(tagBtn)

  })

}

/* メッセージ追加 */
const supportText = document.createElement("p")
supportText.className = "support-text"
supportText.innerText = "Enjoying these free photos?"

photoContainer.appendChild(supportText)

  
const support = document.createElement("a")
support.href = "https://buymeacoffee.com/scapestock"
support.target = "_blank"
support.className = "support-btn"
support.innerText = "Buy Me a Coffee ☕"

photoContainer.appendChild(support)

loadRelatedPhotos(photo)

}



/* --------------------------
   検索フォーム
-------------------------- */

function setupSearch(){

const form=document.getElementById("search-form")

if(!form) return

form.addEventListener("submit",function(e){

e.preventDefault()

const word=document
.getElementById("search-input")
.value
.toLowerCase()

window.location.href="index.html?search="+word

})

}

/* --------------------------
   初期読み込み
-------------------------- */

document.addEventListener("DOMContentLoaded",()=>{

  if(document.getElementById("gallery")){
    initGallery()
  }

  if(document.getElementById("photo-page")){
    loadPhotoPage()
  }

  setupSearch()

})

function resizeGridItems(){

const grid=document.querySelector(".gallery");
const rowHeight=parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
const rowGap=parseInt(window.getComputedStyle(grid).getPropertyValue('gap'));

grid.querySelectorAll("a").forEach(item=>{

const img=item.querySelector("img");

const height=img.getBoundingClientRect().height;

const span=Math.ceil((height+rowGap)/(rowHeight+rowGap));

item.style.gridRowEnd="span "+span;

});

}

window.addEventListener("load",resizeGridItems);
window.addEventListener("resize",resizeGridItems);

/* --------------------------
   関連写真
-------------------------- */

function loadRelatedPhotos(currentPhoto){

const container=document.getElementById("related-photos")
if(!container) return

// 関連度スコア計算
const scoredPhotos = PHOTOS.map(photo=>{

if(photo.id===currentPhoto.id) return null

// タグ一致数をカウント
const matchCount = photo.tags.filter(tag =>
currentPhoto.tags.includes(tag)
).length

return {
photo:photo,
score:matchCount
}

})
.filter(item => item && item.score >= 2) // ★ここが重要（2以上）
.sort((a,b)=> b.score - a.score) // 多い順に並び替え
.slice(0,12) // 上位12枚

// 表示
scoredPhotos.forEach(item=>{

const photo=item.photo

const link=document.createElement("a")
link.href="photo.html?id="+photo.id

const img=document.createElement("img")
// 👇 関連写真のところも同様に、自動で適切な thu フォルダを判定します
const thuFolder = photo.folder ? photo.folder.replace("full", "thu") : "thu01";
img.src = "images/" + thuFolder + "/" + photo.id + "_thu.jpg";

img.alt = generateTitle(photo);
img.loading="lazy"

link.appendChild(img)
container.appendChild(link)

})

}
