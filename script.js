function getPhotoId(){

const params=new URLSearchParams(window.location.search)

return params.get("id")

}

function loadGallery(){

const gallery=document.getElementById("gallery")

if(!gallery) return

gallery.innerHTML=""

const params=new URLSearchParams(window.location.search)
const tag=params.get("tag")

PHOTOS.forEach(photo=>{

if(tag && !photo.tags.includes(tag)) return

const link=document.createElement("a")

link.href="photo.html?id="+photo.id

const img=document.createElement("img")

img.src="images/thu/"+photo.id+"_thu.jpg"

img.alt=photo.tags.join(" ")

img.loading="lazy"

link.appendChild(img)

gallery.appendChild(link)

})

}

function loadPhotoPage(){

const photoContainer=document.getElementById("photo-page")

if(!photoContainer) return

const id=getPhotoId()

const photo=PHOTOS.find(p=>p.id===id)

if(!photo) return

const img=document.createElement("img")

img.src="images/full/"+photo.id+".jpg"

img.alt=photo.tags.join(" ")

const download=document.createElement("a")

download.href="images/full/"+photo.id+".jpg"

download.className="download-btn"

download.download=photo.id+".jpg"

download.innerText="Download"

photoContainer.appendChild(img)

photoContainer.appendChild(download)

}

document.addEventListener("DOMContentLoaded",()=>{

loadGallery()

loadPhotoPage()

})
