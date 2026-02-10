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
  // DEĞİŞİKLİK 1: Hem resim hem video kabul et
  input.accept = "image/*, video/*"; 
  input.multiple = true;

  const gallery = document.createElement("div");
  gallery.className = "day-gallery";

  db.ref(`${dbPath}/images`).on('value', (snapshot) => {
    gallery.innerHTML = "";
    const medias = snapshot.val() || []; // Değişken adını images yerine medias yaptım (genel olduğu için)
    medias.forEach((src, index) => {
      const imgWrap = document.createElement("div");
      imgWrap.className = "img-wrap";
      
      // DEĞİŞİKLİK 2: Veri video mu resim mi kontrol et
      let mediaElement;
      if(src.startsWith("data:video")) {
          // Eğer videoysa video etiketi oluştur
          mediaElement = document.createElement("video");
          mediaElement.src = src;
          mediaElement.style.maxWidth = "100%"; // Tasarımı bozmaması için
          // Küçük önizlemede kontroller olmasın, tıklayınca lightbox'ta açılır
          // İstersen buraya 'controls' ekleyerek direkt burada da oynatabilirsin
      } else {
          // Değilse resim etiketi oluştur (Eski yöntem)
          mediaElement = document.createElement("img");
          mediaElement.src = src;
      }

      const del = document.createElement("span");
      del.innerText = "🗑";
      del.onclick = (e) => {
        e.stopPropagation(); // Silme butonuna basınca lightbox açılmasın
        const updatedMedias = medias.filter((_, i) => i !== index);
        db.ref(`${dbPath}/images`).set(updatedMedias);
      };

      imgWrap.append(mediaElement, del);
      gallery.appendChild(imgWrap);
    });
  });

  input.onchange = () => {
    const files = Array.from(input.files);
    // Videolar büyük olduğu için veritabanı limitine takılabilir, uyarısı aşağıda*
    db.ref(`${dbPath}/images`).once('value').then(snapshot => {
      const currentMedias = snapshot.val() || [];
      
      // Promise yapısı kullanarak tüm dosyaların okunmasını bekle
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

/* ---------- LIGHTBOX (GÖRSEL BÜYÜTME) SİSTEMİ ---------- */



// 1. Lightbox elemanlarını oluştur (Eğer HTML'de yoksa)

/* ---------- LIGHTBOX (GÖRSEL/VIDEO BÜYÜTME) SİSTEMİ ---------- */

// 1. Lightbox elemanlarını oluştur
let lightbox = document.getElementById("lightbox");
if(!lightbox){
  lightbox = document.createElement("div");
  lightbox.id = "lightbox";
  // İçeriğe hem img hem video etiketi ekliyoruz, hangisi lazımsa onu göstereceğiz
  lightbox.innerHTML = `
    <span id="closeLightbox">&times;</span>
    <div id="lightbox-content" style="position:relative; display:flex; justify-content:center; align-items:center;">
        <img id="lightbox-img" style="display:none; max-width:90%; max-height:80vh;">
        <video id="lightbox-video" controls style="display:none; max-width:90%; max-height:80vh;"></video>
    </div>
  `;
  document.body.appendChild(lightbox);
}

const lbImg = document.getElementById("lightbox-img");
const lbVideo = document.getElementById("lightbox-video");
const lbClose = document.getElementById("closeLightbox");

// 2. Galeri öğesine (resim veya video) tıklandığında açma olayı
document.addEventListener("click", e => {
  // Tıklanan şey bir galeri görseli veya videosu mu kontrol et
  const target = e.target;
  
  if (target.closest(".day-gallery")) {
      // Eğer tıklanan bir resimse
      if (target.tagName === "IMG") {
          lbVideo.style.display = "none";
          lbVideo.pause(); // Varsa çalan videoyu durdur
          lbImg.src = target.src;
          lbImg.style.display = "block";
          lightbox.classList.add("show");
          document.body.style.overflow = "hidden";
      }
      // Eğer tıklanan bir videoysa
      else if (target.tagName === "VIDEO") {
          lbImg.style.display = "none";
          lbVideo.src = target.src;
          lbVideo.style.display = "block";
          lightbox.classList.add("show");
          // Otomatik oynatmak istersen:
          // lbVideo.play(); 
          document.body.style.overflow = "hidden";
      }
  }
});

// 3. Kapatma olayları
const closeLB = () => {
  lightbox.classList.remove("show");
  document.body.style.overflow = "auto";
  lbVideo.pause(); // Kapatınca videoyu durdur
  lbVideo.src = ""; // Kaynağı boşalt
};

lbClose.onclick = closeLB;

lightbox.onclick = (e) => {
  // Eğer tıklanan yer resim veya video değilse (boşluksa) kapat
  if (e.target !== lbImg && e.target !== lbVideo) {
    closeLB();
  }
};

// Sayfa yüklendiğinde çalıştır
if(ayKey && months[ayKey]) renderCalendar();
