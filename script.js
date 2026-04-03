function generateDescription(photo) {
  const tags = photo.tags || [];

  const locationTags = ["tokyo","chiba","kyoto","osaka","japan","ginza","nihonbashi","ichikawa"];
  const timeTags = ["daytime","night","sunset","sunny"];
  const seasonTags = ["spring","summer","june","rainy-season"];
  const subjectTags = ["city","cityscape","building","road","street","flower","tree","sky","cloud","temple","shrine"];

  const location = photo.city || tags.find(t => locationTags.includes(t));
  const time = tags.find(t => timeTags.includes(t));
  const season = tags.find(t => seasonTags.includes(t));
  const subject = tags.find(t => subjectTags.includes(t));

  const cap = s => s ? s.charAt(0).toUpperCase() + s.replace(/-/g," ").slice(1) : "";

  const locationText = location ? `${cap(location)}, Japan` : "Japan";
  const subjectText = subject ? cap(subject) : "scene";

  const sentence1 = `A photo of ${subjectText} in ${locationText}.`;

  const sentence2 = time
    ? `Captured during the ${time}.`
    : season
    ? `Captured in ${season}.`
    : `This image captures a moment in Japan.`;

  const sentence3 = `Perfect for travel and Japan-related projects.`;

  return `${sentence1} ${sentence2} ${sentence3}`;
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
img.src="images/thu/"+photo.id+"_thu.jpg"
img.alt=photo.tags.join(" ")
img.loading="lazy"

link.appendChild(img)
gallery.appendChild(link)

})
resizeGridItems()
window.dispatchEvent(new Event("resize"))   

loading=false
currentPage++

}

/* --------------------------
   無限スクロール
-------------------------- */

window.addEventListener("scroll",()=>{

if(loading) return

if(window.innerHeight+window.scrollY>=document.body.offsetHeight-600){

loading=true
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

img.src="images/full/"+photo.id+".jpg"



const desc = generateDescription(photo);
img.alt = desc;  
document.getElementById("description").textContent = desc;
document
  .querySelector('meta[name="description"]')
  .setAttribute("content", desc);  
  
const download=document.createElement("a")

download.href="images/full/"+photo.id+".jpg"

download.className="download-btn"

download.download=photo.id+".jpg"

download.innerText="Download"

photoContainer.appendChild(img)
photoContainer.appendChild(download)
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

initGallery()
loadPhotoPage()
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
img.src="images/thu/"+photo.id+"_thu.jpg"
img.alt=photo.tags.join(" ")
img.loading="lazy"

link.appendChild(img)
container.appendChild(link)

})

}
