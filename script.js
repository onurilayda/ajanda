/* ---------- THEME ---------- */
const themeBtn = document.getElementById("themeBtn");
if (themeBtn) {
  themeBtn.onclick = () => document.body.classList.toggle("dark");
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

/* ---------- FIREBASE ---------- */
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

/* ---------- BAŞLIK ---------- */
if (ayKey && months[ayKey]) {
  document.getElementById("monthTitle").innerText =
    months[ayKey].name + " 2026";
  renderCalendar();
}

/* ---------- GÜNLER ---------- */
function renderCalendar(){
  calendar.innerHTML = "";

  for(let d = 1; d <= months[ayKey].days; d++){
    createDayCard(d);
  }
}

function createDayCard(dayNumber){
  const day = document.createElement("div");
  day.className = "day fade-up";

  const h = document.createElement("h3");
  h.innerText = `${dayNumber}. Gün`;

  const ta = document.createElement("textarea");
  ta.placeholder = "Yaz bakalım.";

  /* 🔥 FIREBASE OKU */
  db.ref(`ajanda/${ayKey}/${dayNumber}`).on("value", snap => {
    ta.value = snap.val() || "";
  });

  /* 🔥 FIREBASE YAZ */
  ta.addEventListener("input", () => {
    db.ref(`ajanda/${ayKey}/${dayNumber}`).set(ta.value);
  });

  /* ---------- FOTO (LOCAL) ---------- */
  const imgKey = `${ayKey}-${dayNumber}-images`;
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.multiple = true;

  const gallery = document.createElement("div");
  gallery.className = "day-gallery";

  const saved = JSON.parse(localStorage.getItem(imgKey) || "[]");
  saved.forEach(src => addImage(src, gallery, imgKey));

  input.onchange = () => {
    [...input.files].forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const current = JSON.parse(localStorage.getItem(imgKey) || "[]");
        current.push(reader.result);
        localStorage.setItem(imgKey, JSON.stringify(current));
        addImage(reader.result, gallery, imgKey);
      };
      reader.readAsDataURL(file);
    });
  };

  day.append(h, ta, input, gallery);
  calendar.appendChild(day);
}

function addImage(src, gallery, imgKey){
  const wrap = document.createElement("div");
  wrap.className = "img-wrap";

  const img = document.createElement("img");
  img.src = src;

  const del = document.createElement("span");
  del.innerText = "🗑";
  del.onclick = () => {
    const updated = JSON.parse(localStorage.getItem(imgKey) || [])
      .filter(i => i !== src);
    localStorage.setItem(imgKey, JSON.stringify(updated));
    wrap.remove();
  };

  wrap.append(img, del);
  gallery.appendChild(wrap);
}
