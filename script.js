/* ---------- THEME & FONT ---------- */
const themeBtn = document.getElementById("themeBtn");
if(themeBtn){
  themeBtn.onclick = ()=> document.body.classList.toggle("dark");
}

/* ---------- AY VERİLERİ ---------- */
const months = {
  ocak:{ name:"Ocak", days:31 },
  subat:{ name:"Şubat", days:28 },
  mart:{ name:"Mart", days:31 },
  nisan:{ name:"Nisan", days:30 },
  mayis:{ name:"Mayıs", days:31 },
  haziran:{ name:"Haziran", days:30 },
  temmuz:{ name:"Temmuz", days:31 },
  agustos:{ name:"Ağustos", days:31 },
  eylul:{ name:"Eylül", days:30 },
  ekim:{ name:"Ekim", days:31 },
  kasim:{ name:"Kasım", days:30 },
  aralik:{ name:"Aralık", days:31 }
};

const params = new URLSearchParams(location.search);
const ayKey = params.get("ay");

const calendar = document.getElementById("calendar");

if(ayKey && months[ayKey]){
  document.getElementById("monthTitle").innerText =
    months[ayKey].name + " 2026";

  renderCalendar("daily");
}

/* ---------- RENDER ---------- */
function renderCalendar(view){
  calendar.innerHTML = "";

  if(view === "daily"){
    for(let d=1; d<=months[ayKey].days; d++){
      createDayCard(d);
    }
  } else {
    const totalDays = months[ayKey].days;
    const weeks = Math.ceil(totalDays / 7);

    for(let w=0; w<weeks; w++){
      const weekCard = document.createElement("div");
      weekCard.className = "week-card fade-up";

      const title = document.createElement("h3");
      title.innerText = "Hafta " + (w+1);

      const daysWrap = document.createElement("div");
      daysWrap.className = "week-days";

      for(let d=1+w*7; d<=Math.min((w+1)*7, totalDays); d++){
        const dayDiv = document.createElement("div");
        dayDiv.className = "day-small";

        const span = document.createElement("span");
        span.innerText = d;

        const key = `${ayKey}-${d}-text`;
        const ta = document.createElement("textarea");
        ta.value = localStorage.getItem(key)||"";
        ta.oninput = ()=> localStorage.setItem(key, ta.value);

        dayDiv.append(span, ta);
        daysWrap.appendChild(dayDiv);
      }

      weekCard.append(title, daysWrap);
      calendar.appendChild(weekCard);
    }
  }
}

/* ---------- GÜN KARTI ---------- */
function createDayCard(d){
  const textKey = `${ayKey}-${d}-text`;
  const imgKey  = `${ayKey}-${d}-images`;

  const day = document.createElement("div");
  day.className = "day fade-up";
  
  const h = document.createElement("h3");
  h.innerText = d + ". Gün";

  const ta = document.createElement("textarea");
  ta.placeholder = "Yaz bakim.";
  ta.value = localStorage.getItem(textKey)||"";
  ta.oninput = ()=> localStorage.setItem(textKey, ta.value);

  const input = document.createElement("input");
  input.type="file";
  input.accept="image/*";
  input.multiple=true;

  const gallery = document.createElement("div");
  gallery.className="day-gallery";

  const saved = JSON.parse(localStorage.getItem(imgKey)||"[]");
saved.forEach(src=>{
  const imgWrap = document.createElement("div");
  imgWrap.className = "img-wrap";

  const img = document.createElement("img");
  img.src = src;

  const del = document.createElement("span");
  del.innerText = "🗑";
  del.onclick = ()=>{
    const updated = JSON.parse(localStorage.getItem(imgKey)||[])
      .filter(i => i !== src);
    localStorage.setItem(imgKey, JSON.stringify(updated));
    imgWrap.remove();
  };

  imgWrap.append(img, del);
  gallery.appendChild(imgWrap);
});


  input.onchange=()=>{
    input.onchange = ()=>{
  const files = Array.from(input.files);
  const current = JSON.parse(localStorage.getItem(imgKey)||"[]");

  files.forEach(file=>{
    const reader = new FileReader();
    reader.onload = ()=>{
      current.push(reader.result);
      localStorage.setItem(imgKey, JSON.stringify(current));

      const imgWrap = document.createElement("div");
      imgWrap.className = "img-wrap";

      const img = document.createElement("img");
      img.src = reader.result;

      const del = document.createElement("span");
      del.innerText = "🗑";
      del.onclick = ()=>{
        const updated = JSON.parse(localStorage.getItem(imgKey)||[])
          .filter(i => i !== reader.result);
        localStorage.setItem(imgKey, JSON.stringify(updated));
        imgWrap.remove();
      };

      imgWrap.append(img, del);
      gallery.appendChild(imgWrap);
    };
    reader.readAsDataURL(file);
  });
};


    files.forEach(f=>{
      const r = new FileReader();
      r.onload=()=>{
        current.push(r.result);
        localStorage.setItem(imgKey, JSON.stringify(current));
        const img = document.createElement("img");
        img.src = r.result;
        gallery.appendChild(img);
      };
      r.readAsDataURL(f);
    });
  };

  day.append(h, ta, input, gallery);
  calendar.appendChild(day);
}


function renderCalendar(){
  calendar.innerHTML = "";
  for(let d=1; d<=months[ayKey].days; d++){
    createDayCard(d);
  }
}
renderCalendar();
/* ================= LIGHTBOX (GARANTİ) ================= */

let lightbox = document.getElementById("lightbox");

if(!lightbox){
  lightbox = document.createElement("div");
  lightbox.id = "lightbox";
  lightbox.innerHTML = `
    <img id="lightbox-img">
    <button id="closeLightbox">✕</button>
  `;
  document.body.appendChild(lightbox);
}

const lbImg = document.getElementById("lightbox-img");
const lbClose = document.getElementById("closeLightbox");

lbClose.onclick = ()=> lightbox.classList.remove("show");

/* 🔴 KRİTİK OLAY */
document.addEventListener("click", e=>{
  const img = e.target.closest(".day-gallery img");
  if(img){
    lbImg.src = img.src;
    lightbox.classList.add("show");
  }
});

lightbox.addEventListener("click", e=>{
  if(e.target === lightbox){
    lightbox.classList.remove("show");

    /* =====================
   AY AYARLARI
===================== */
const AY = "ocak";
const GUN_SAYISI = 31;

/* =====================
   FIREBASE
===================== */
const firebaseConfig = {
  apiKey: "AIzaSyBHXwARt_g0fLa4XlelwWsLT5FQyEPBBqc",
  authDomain: "ajanda-e0287.firebaseapp.com",
  databaseURL: "https://ajanda-e0287-default-rtdb.firebaseio.com",
  projectId: "ajanda-e0287",
  appId: "1:819622658290:web:28e097a95a51d1eb8b106b"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.database();

/* =====================
   GÜNLERİ OLUŞTUR
===================== */
const calendar = document.getElementById("calendar");

for (let gun = 1; gun <= GUN_SAYISI; gun++) {
  const card = document.createElement("div");
  card.className = "day-card";

  card.innerHTML = `
    <h3>${gun}. Gün</h3>

    <textarea
      placeholder="Yaz bakalım."
      data-ay="${AY}"
      data-gun="${gun}"></textarea>

    <input type="file">
  `;

  calendar.appendChild(card);
}

/* =====================
   FIREBASE BAĞLA
===================== */
document.querySelectorAll("textarea[data-ay]").forEach(area => {
  const ay = area.dataset.ay;
  const gun = area.dataset.gun;

  // Firebase → textarea
  db.ref(`ajanda/${ay}/${gun}`).on("value", snap => {
    area.value = snap.val() || "";
  });

  // textarea → Firebase
  area.addEventListener("input", () => {
    db.ref(`ajanda/${ay}/${gun}`).set(area.value);
  });
});

  }
});

