const firebaseConfig = {

  apiKey: "AIzaSyBHXwARt_g0fLa4XlelwWsLT5FQyEPBBqc",

  authDomain: "ajanda-e0287.firebaseapp.com",

  databaseURL: "https://ajanda-e0287-default-rtdb.firebaseio.com",

  projectId: "ajanda-e0287",

  storageBucket: "ajanda-e0287.firebasestorage.app",

  messagingSenderId: "819622658290",

  appId: "1:819622658290:web:28e097a95a51d1eb8b106b",

  measurementId: "G-S12P6T3X1H"

};



firebase.initializeApp(firebaseConfig);

const db = firebase.database();



const themeBtn = document.getElementById("themeBtn");

if(themeBtn){

  themeBtn.onclick = () => document.body.classList.toggle("dark");

}



const months = {

  ocak:{ name:"Ocak", days:31 }, subat:{ name:"Şubat", days:28 },

  mart:{ name:"Mart", days:31 }, nisan:{ name:"Nisan", days:30 },

  mayis:{ name:"Mayıs", days:31 }, haziran:{ name:"Haziran", days:30 },

  temmuz:{ name:"Temmuz", days:31 }, agustos:{ name:"Ağustos", days:31 },

  eylul:{ name:"Eylül", days:30 }, ekim:{ name:"Ekim", days:31 },

  kasim:{ name:"Kasım", days:30 }, aralik:{ name:"Aralık", days:31 }

};



const params = new URLSearchParams(location.search);

const ayKey = params.get("ay");

const calendar = document.getElementById("calendar");



function renderCalendar(){

  if(!calendar || !ayKey) return;

  calendar.innerHTML = "";

  document.getElementById("monthTitle").innerText = months[ayKey].name + " 2026";

  for(let d=1; d<=months[ayKey].days; d++){

    createDayCard(d);

  }

}



function createDayCard(d){

  const dbPath = `ajanda/${ayKey}/gun-${d}`;

  const day = document.createElement("div");

  day.className = "day fade-up";

  

  const h = document.createElement("h3");

  h.innerText = d + ". Gün";



  const ta = document.createElement("textarea");

  ta.placeholder = "Günün notunu buraya yaz...";



  db.ref(`${dbPath}/text`).on('value', (snapshot) => {

    ta.value = snapshot.val() || "";

  });



  ta.oninput = () => {

    db.ref(`${dbPath}/text`).set(ta.value);

  };



  const input = document.createElement("input");

  input.type = "file";

  input.accept = "image/*";

  input.multiple = true;



  const gallery = document.createElement("div");

  gallery.className = "day-gallery";



  db.ref(`${dbPath}/images`).on('value', (snapshot) => {

    gallery.innerHTML = "";

    const images = snapshot.val() || [];

    images.forEach((src, index) => {

      const imgWrap = document.createElement("div");

      imgWrap.className = "img-wrap";

      const img = document.createElement("img");

      img.src = src;

      const del = document.createElement("span");

      del.innerText = "🗑";

      del.onclick = () => {

        const updatedImages = images.filter((_, i) => i !== index);

        db.ref(`${dbPath}/images`).set(updatedImages);

      };

      imgWrap.append(img, del);

      gallery.appendChild(imgWrap);

    });

  });



  input.onchange = () => {

    const files = Array.from(input.files);

    db.ref(`${dbPath}/images`).once('value').then(snapshot => {

      const currentImages = snapshot.val() || [];

      files.forEach(file => {

        const reader = new FileReader();

        reader.onload = () => {

          currentImages.push(reader.result);

          db.ref(`${dbPath}/images`).set(currentImages);

        };

        reader.readAsDataURL(file);

      });

    });

  };



  day.append(h, ta, input, gallery);

  calendar.appendChild(day);

}

/* ---------- LIGHTBOX (GÖRSEL BÜYÜTME) SİSTEMİ ---------- */



// 1. Lightbox elemanlarını oluştur (Eğer HTML'de yoksa)

let lightbox = document.getElementById("lightbox");

if(!lightbox){

  lightbox = document.createElement("div");

  lightbox.id = "lightbox";

  lightbox.innerHTML = `

    <span id="closeLightbox">&times;</span>

    <img id="lightbox-img">

  `;

  document.body.appendChild(lightbox);

}



const lbImg = document.getElementById("lightbox-img");

const lbClose = document.getElementById("closeLightbox");



// 2. Görsele tıklandığında açma olayı

document.addEventListener("click", e => {

  // Tıklanan şey bir galeri görseli mi kontrol et

  const img = e.target.closest(".day-gallery img");

  if(img){

    lbImg.src = img.src; // Tıklanan resmin kaynağını al

    lightbox.classList.add("show"); // Lightbox'ı göster

    document.body.style.overflow = "hidden"; // Sayfanın kaymasını engelle

  }

});



// 3. Kapatma olayları (Çarpıya basınca veya dışarıya tıklayınca)

const closeLB = () => {

  lightbox.classList.remove("show");

  document.body.style.overflow = "auto"; // Kaydırmayı geri aç

};



lbClose.onclick = closeLB;

// Kapatma fonksiyonunu şu şekilde güncellemek daha garanti olur:

lightbox.onclick = (e) => {

  // Eğer tıklanan şey resmin kendisi değilse kapat

  if (e.target.id !== "lightbox-img") {

    lightbox.classList.remove("show");

    document.body.style.overflow = "auto";

  }

};

// Sayfa yüklendiğinde çalıştır

if(ayKey && months[ayKey]) renderCalendar();
