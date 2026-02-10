/* 1. FIREBASE AYARLARI */
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

/* 2. TEMA VE AY AYARLARI */
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

/* 3. TAKVİM RENDER FONKSİYONLARI */
function renderCalendar(){
  if(!calendar || !ayKey || !months[ayKey]) return; // Hata kontrolü eklendi
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

  // Metin verisini çek
  db.ref(`${dbPath}/text`).on('value', (snapshot) => {
    ta.value = snapshot.val() || "";
  });

  // Metin değişince kaydet
  ta.oninput = () => {
    db.ref(`${dbPath}/text`).set(ta.value);
  };

  // Dosya yükleme alanı
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*, video/*"; // Resim ve Video
  input.multiple = true;

  const gallery = document.createElement("div");
  gallery.className = "day-gallery";

  // Görselleri/Videoları çek ve listele
  db.ref(`${dbPath}/images`).on('value', (snapshot) => {
    gallery.innerHTML = "";
    const medias = snapshot.val() || []; 
    
    medias.forEach((src, index) => {
      const imgWrap = document.createElement("div");
      imgWrap.className = "img-wrap";
      
      let mediaElement;
      // Veri türünü kontrol et (Video mu Resim mi?)
      if(src && src.startsWith("data:video")) {
          mediaElement = document.createElement("video");
          mediaElement.src = src;
          // Mobilde tasarım bozulmasın diye stil
          mediaElement.style.width = "100%";
          mediaElement.style.height = "100%";
          mediaElement.style.objectFit = "cover";
      } else {
          mediaElement = document.createElement("img");
          mediaElement.src = src;
      }

      const del = document.createElement("span");
      del.innerText = "🗑";
      del.onclick = (e) => {
        e.stopPropagation(); // Tıklama lightbox'ı açmasın
        const updatedMedias = medias.filter((_, i) => i !== index);
        db.ref(`${dbPath}/images`).set(updatedMedias);
      };

      imgWrap.append(mediaElement, del);
      gallery.appendChild(imgWrap);
    });
  });

  // Dosya seçilince veritabanına kaydet
  input.onchange = () => {
    const files = Array.from(input.files);
    db.ref(`${dbPath}/images`).once('value').then(snapshot => {
      const currentMedias = snapshot.val() || [];
      
      const fileReaders = files.map(file => {
          return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(file);
          });
      });

      Promise.all(fileReaders).then(results => {
          results.forEach(result => currentMedias.push(result));
          db.ref(`${dbPath}/images`).set(currentMedias);
      });
    });
  };

  day.append(h, ta, input, gallery);
  calendar.appendChild(day);
}

/* 4. LIGHTBOX (BÜYÜTME) SİSTEMİ - DÜZELTİLDİ */

// Elemanları güvenli bir şekilde oluştur veya seç
let lightbox = document.getElementById("lightbox");
if(!lightbox){
  lightbox = document.createElement("div");
  lightbox.id = "lightbox";
  lightbox.innerHTML = `
    <span id="closeLightbox">&times;</span>
    <div id="lightbox-content" style="position:relative; display:flex; justify-content:center; align-items:center;">
        <img id="lightbox-img" style="display:none; max-width:90%; max-height:80vh;">
        <video id="lightbox-video" controls style="display:none; max-width:90%; max-height:80vh;"></video>
    </div>
  `;
  document.body.appendChild(lightbox);
}

// Elemanları seç (HTML oluşturulduktan sonra)
const lbImg = document.getElementById("lightbox-img");
const lbVideo = document.getElementById("lightbox-video");
const lbClose = document.getElementById("closeLightbox");

// Açma Olayı
document.addEventListener("click", e => {
  const target = e.target;
  
  if (target.closest(".day-gallery")) {
      // Resimse
      if (target.tagName === "IMG") {
          lbVideo.style.display = "none";
          lbVideo.pause(); 
          lbImg.src = target.src;
          lbImg.style.display = "block";
          lightbox.classList.add("show");
          document.body.style.overflow = "hidden";
      }
      // Videoysa
      else if (target.tagName === "VIDEO") {
          lbImg.style.display = "none";
          lbVideo.src = target.src;
          lbVideo.style.display = "block";
          lightbox.classList.add("show");
          lbVideo.play().catch(e => console.log("Otomatik oynatma engellendi")); // Hata vermemesi için catch
          document.body.style.overflow = "hidden";
      }
  }
});

// Kapatma Fonksiyonu
const closeLB = () => {
  lightbox.classList.remove("show");
  document.body.style.overflow = "auto";
  lbVideo.pause(); 
  lbVideo.src = ""; // Kaynağı boşalt
};

// Kapatma Tetikleyicileri
if(lbClose) lbClose.onclick = closeLB;

lightbox.onclick = (e) => {
  if (e.target !== lbImg && e.target !== lbVideo) {
    closeLB();
  }
};

/* 5. BAŞLAT */
if(ayKey && months[ayKey]) renderCalendar();
