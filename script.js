function getPhotoId(){

const params = new URLSearchParams(window.location.search)
return params.get("id")

}


/* --------------------------
   ランダムシャッフル
-------------------------- */

function shuffleArray(array){

const copied = [...array]

for(let i = copied.length - 1; i > 0; i--){

const j = Math.floor(Math.random() * (i + 1))

const temp = copied[i]
copied[i] = copied[j]
copied[j] = temp

}

return copied

}


/* --------------------------
   ギャラリー表示
-------------------------- */

function loadGallery(){

const gallery = document.getElementById("gallery")

if(!gallery) return

gallery.innerHTML = ""

const params = new URLSearchParams(window.location.search)

const tag = params.get("tag")
const search = params.get("search")

/* ランダム表示 */
let photos = shuffleArray(PHOTOS)
const PER_PAGE = 40
const page = parseInt(params.get("page")) || 1
const start = (page - 1) * PER_PAGE
const end = start + PER_PAGE
   
photos.slice(start,end).forEach(photo=>{

/* タグ検索 */

if(tag && !photo.tags.includes(tag)) return


/* 複数ワード検索 */

if(search){

const words = search
.toLowerCase()
.split(" ")
.filter(Boolean)

const match = words.every(word =>
photo.tags.map(t => t.toLowerCase()).includes(word)
)

if(!match) return

}


/* 画像リンク */

const link = document.createElement("a")

link.href = "photo.html?id=" + photo.id


/* サムネイル */

const img = document.createElement("img")

img.src = "images/thu/" + photo.id + "_thu.jpg"

img.alt = photo.tags.join(" ")

img.loading = "lazy"


link.appendChild(img)

gallery.appendChild(link)

})

}


/* --------------------------
   写真ページ
-------------------------- */

function loadPhotoPage(){

const photoContainer = document.getElementById("photo-page")

if(!photoContainer) return

const id = getPhotoId()

const photo = PHOTOS.find(p => p.id === id)

if(!photo) return


/* フル画像 */

const img = document.createElement("img")

img.src = "images/full/" + photo.id + ".jpg"

img.alt = photo.tags.join(" ")


/* ダウンロード */

const download = document.createElement("a")

download.href = "images/full/" + photo.id + ".jpg"

download.className = "download-btn"

download.download = photo.id + ".jpg"

download.innerText = "Download"


photoContainer.appendChild(img)

photoContainer.appendChild(download)

}


/* --------------------------
   検索フォーム
-------------------------- */

function setupSearch(){

const form = document.getElementById("search-form")

if(!form) return

form.addEventListener("submit",function(e){

e.preventDefault()

const word = document
.getElementById("search-input")
.value
.toLowerCase()

window.location.href = "index.html?search=" + word

})

}


/* --------------------------
   初期読み込み
-------------------------- */

document.addEventListener("DOMContentLoaded",()=>{

loadGallery()

loadPhotoPage()

setupSearch()

})



let loading=false

window.addEventListener("scroll",()=>{

if(loading) return

if(window.innerHeight + window.scrollY >= document.body.offsetHeight - 500){

loading=true

const params = new URLSearchParams(window.location.search)

let page = parseInt(params.get("page")) || 1

page++

params.set("page",page)

window.location.search=params.toString()

}

})
