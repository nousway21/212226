/* =========================================================
   SOZLAMALAR
   ========================================================= */
const PASSWORD = "212226";

const WORDS = ["Shahruza", "Sen", "Yagonasan", "Esingdami?", "Shahruza"];

const MESSAGES = [
  "Seni o'ylasam, kun o'zi yengil bo'lib qoladi.",
  "Kulishingni eslasam, hamma narsa joyiga tushadi.",
  "Sen yonimda bo'lmasang ham, yonimdasan.",
  "Dunyoda ko'p odam bor, lekin ko'zim seni qidiradi.",
  "Eng yaxshi kunlarim hali oldinda. Sen bilan."
];

const FOG_TEXT = "Seni taniganimdan beri dunyo birdan chiroyliroq ko'rina boshladi.";

const POSITIONS = [[16, 30], [38, 68], [55, 24], [74, 62], [88, 28]];

/* =========================================================
   1. Parol
   ========================================================= */
const gate = document.getElementById("gate");
const site = document.getElementById("site");
const form = document.getElementById("gateForm");
const pass = document.getElementById("pass");
const gateMsg = document.getElementById("gateMsg");

function unlock() {
  gate.hidden = true;
  site.hidden = false;
  document.body.style.background = "#070913";
  startSky();
  buildStars();
  buildFog();
  buildWishes();
  initFinalQuestion();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (pass.value === PASSWORD) {
    unlock();
  } else {
    gateMsg.textContent = "noto'g'ri";
    pass.value = "";
    pass.focus();
  }
});
pass.addEventListener("input", () => { gateMsg.textContent = ""; });

/* =========================================================
   2. Zarrachalardan so'z
   ========================================================= */
function startSky() {
  const canvas = document.getElementById("sky");
  const ctx = canvas.getContext("2d");
  const hint = document.getElementById("hint");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W, H, dpr, particles = [], wordIndex = 0, clicks = 0;
  const pointer = { x: -999, y: -999 };

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function pointsFor(word) {
    const off = document.createElement("canvas");
    off.width = W; off.height = H;
    const o = off.getContext("2d");
    let fs = 220;
    o.font = `300 ${fs}px "Cormorant Garamond", Georgia, serif`;
    fs = Math.min(fs * (W * 0.82) / o.measureText(word).width, H * 0.32);
    o.font = `300 ${fs}px "Cormorant Garamond", Georgia, serif`;
    o.textAlign = "center"; o.textBaseline = "middle";
    o.fillStyle = "#fff";
    o.fillText(word, W / 2, H / 2);
    const gap = W < 600 ? 4 : 5;
    const data = o.getImageData(0, 0, W, H).data;
    const pts = [];
    for (let y = 0; y < H; y += gap) {
      for (let x = 0; x < W; x += gap) {
        if (data[(y * W + x) * 4 + 3] > 128) pts.push([x, y]);
      }
    }
    return pts;
  }

  function morphTo(word) {
    const pts = pointsFor(word).sort(() => Math.random() - 0.5);
    while (particles.length < pts.length) {
      particles.push({ x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, tx: 0, ty: 0, a: 1, r: 1 + Math.random() * 0.9 });
    }
    particles.forEach((p, i) => {
      if (i < pts.length) {
        p.tx = pts[i][0]; p.ty = pts[i][1]; p.on = true;
      } else {
        p.tx = Math.random() * W; p.ty = Math.random() * H; p.on = false;
      }
      if (!reduce) { p.vx += (Math.random() - 0.5) * 14; p.vy += (Math.random() - 0.5) * 14; }
    });
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    for (const p of particles) {
      p.vx += (p.tx - p.x) * 0.018;
      p.vy += (p.ty - p.y) * 0.018;
      const dx = p.x - pointer.x, dy = p.y - pointer.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 9000) { const f = (1 - d2 / 9000) * 2.4; const d = Math.sqrt(d2) || 1; p.vx += dx / d * f; p.vy += dy / d * f; }
      if (!p.on) { p.vx += (Math.random() - 0.5) * 0.15; p.vy += (Math.random() - 0.5) * 0.15; }
      p.vx *= 0.86; p.vy *= 0.86;
      p.x += p.vx; p.y += p.vy;
      ctx.globalAlpha = p.on ? 0.95 : 0.25;
      ctx.fillStyle = p.on && Math.abs(p.tx - p.x) < 2 ? "#f1ecdd" : "#ffd98a";
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
    }
    requestAnimationFrame(frame);
  }

  function move(e) {
    const r = canvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    pointer.x = t.clientX - r.left; pointer.y = t.clientY - r.top;
  }
  canvas.addEventListener("mousemove", move);
  canvas.addEventListener("touchmove", move, { passive: true });
  canvas.addEventListener("touchstart", move, { passive: true });
  canvas.addEventListener("mouseleave", () => { pointer.x = pointer.y = -999; });
  canvas.addEventListener("touchend", () => { pointer.x = pointer.y = -999; });

  canvas.addEventListener("click", () => {
    wordIndex = (wordIndex + 1) % WORDS.length;
    morphTo(WORDS[wordIndex]);
    clicks++;
    if (clicks === WORDS.length - 1) hint.textContent = "pastga tush";
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { size(); morphTo(WORDS[wordIndex]); }, 200);
  });

  size();
  morphTo(WORDS[0]);
  particles.forEach((p) => { p.x = Math.random() * W; p.y = Math.random() * H; p.vx = p.vy = 0; });
  frame();
}

/* =========================================================
   3. Beshta yulduz
   ========================================================= */
function buildStars() {
  const field = document.getElementById("field");
  const panel = document.getElementById("panel");
  const opened = new Set();

  POSITIONS.forEach(([x, y], i) => {
    const b = document.createElement("button");
    b.className = "star";
    b.style.left = x + "%";
    b.style.top = y + "%";
    b.style.setProperty("--d", (i * 0.6) + "s");
    b.setAttribute("aria-label", `Yulduz ${i + 1}`);
    b.addEventListener("click", () => {
      b.classList.add("open");
      panel.textContent = MESSAGES[i];
      panel.classList.remove("fresh");
      void panel.offsetWidth;
      panel.classList.add("fresh");
      opened.add(i);
    });
    field.appendChild(b);
  });
}

/* =========================================================
   4. Tumanlagan oyna
   ========================================================= */
function buildFog() {
  const box = document.getElementById("fog");
  const canvas = document.getElementById("fogCanvas");
  const ctx = canvas.getContext("2d");
  document.getElementById("fogText").textContent = FOG_TEXT;
  let W, H, dpr, last = null;

  function paint() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = box.clientWidth; H = box.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#6c7794";
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 1400; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.08})`;
      ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
    }
  }

  function wipe(x, y) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round"; ctx.lineWidth = 56;
    ctx.beginPath();
    ctx.moveTo(last ? last.x : x, last ? last.y : y);
    ctx.lineTo(x, y);
    ctx.stroke();
    last = { x, y };
  }
  function pos(e) {
    const r = canvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  }
  let down = false;
  canvas.addEventListener("pointerdown", (e) => { down = true; last = null; canvas.setPointerCapture(e.pointerId); const p = pos(e); wipe(p.x, p.y); });
  canvas.addEventListener("pointermove", (e) => { if (down) { const p = pos(e); wipe(p.x, p.y); } });
  ["pointerup", "pointercancel"].forEach((n) => canvas.addEventListener(n, () => { down = false; last = null; }));

  setInterval(() => {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(108,119,148,0.06)";
    ctx.fillRect(0, 0, W, H);
  }, 120);

  paint();
  window.addEventListener("resize", paint);
}

/* =========================================================
   5. Orzu Fonusi
   ========================================================= */
function buildWishes() {
  const form = document.getElementById("wishForm");
  const input = document.getElementById("wishInput");
  const sky = document.getElementById("wishSky");
  const note = document.getElementById("wishNote");
  
  const KEY = "shahruza-wishes";
  let wishes = [];
  try { wishes = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { wishes = []; }

  function renderSavedWish(w) {
    const star = document.createElement("button");
    star.className = "wstar";
    star.style.left = w.x + "%"; star.style.top = w.y + "%";
    star.setAttribute("aria-label", "Orzu yulduzi");
    star.addEventListener("click", () => { note.textContent = `Orzu: "${w.t}"`; });
    sky.appendChild(star);
  }

  wishes.forEach(renderSavedWish);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const t = input.value.trim();
    if (!t) return;

    const wishObj = { t, x: 12 + Math.random() * 76, y: 15 + Math.random() * 55 };

    const lantern = document.createElement("div");
    lantern.className = "lantern";
    lantern.style.left = wishObj.x + "%";
    sky.appendChild(lantern);
    note.textContent = "Fonus sekinlik bilan osmonga ko'tarilmoqda...";
    input.value = "";

    const sparkleInterval = setInterval(() => {
      const s = document.createElement("span");
      s.className = "sparkle";
      s.innerHTML = "✨";
      s.style.left = (wishObj.x + (Math.random() * 6 - 3)) + "%";
      s.style.bottom = "50px";
      sky.appendChild(s);
      setTimeout(() => s.remove(), 2500);
    }, 350);

    setTimeout(() => {
      clearInterval(sparkleInterval);
      lantern.remove();

      renderSavedWish(wishObj);
      wishes.push(wishObj);
      try { localStorage.setItem(KEY, JSON.stringify(wishes)); } catch (e) {}

      note.textContent = "Orzuingiz osmonda porloq yulduzga aylandi! ✨";
    }, 7000);
  });
}

/* =========================================================
   6. Savol, Mushakbozlik va Musiqa Effekti
   ========================================================= */
function initFinalQuestion() {
  const btnNo = document.getElementById("btnNo");
  const btnYes = document.getElementById("btnYes");
  const overlay = document.getElementById("cinematicOverlay");
  const cineText = document.getElementById("cinematicText");
  const fwCanvas = document.getElementById("fireworksCanvas");
  const fwCtx = fwCanvas.getContext("2d");
  const romanticAudio = document.getElementById("romanticAudio");

  // "Yo'q" tugmasi qochib ketishi
  const dodge = () => {
    const rx = (Math.random() - 0.5) * 240;
    const ry = (Math.random() - 0.5) * 140;
    btnNo.style.transform = `translate(${rx}px, ${ry}px)`;
  };
  btnNo.addEventListener("mouseover", dodge);
  btnNo.addEventListener("click", dodge);
  btnNo.addEventListener("touchstart", (e) => { e.preventDefault(); dodge(); });

  let activeFireworks = true;
  let particles = [];

  class Firework {
    constructor(x, y, color) {
      this.x = x; this.y = y;
      this.color = color;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7 + 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.alpha = 1;
      this.decay = Math.random() * 0.012 + 0.008;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      this.vy += 0.06;
      this.alpha -= this.decay;
    }
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function runFireworks() {
    fwCanvas.width = window.innerWidth;
    fwCanvas.height = window.innerHeight;
    activeFireworks = true;

    function loop() {
      if (!activeFireworks) return;
      fwCtx.fillStyle = "rgba(7, 9, 19, 0.25)";
      fwCtx.fillRect(0, 0, fwCanvas.width, fwCanvas.height);

      if (Math.random() < 0.12) {
        const fx = Math.random() * fwCanvas.width;
        const fy = Math.random() * (fwCanvas.height * 0.6);
        const cols = ["#ffd98a", "#ff9d4a", "#ff6b8b", "#ffffff", "#ffcc00", "#ff44aa"];
        const col = cols[Math.floor(Math.random() * cols.length)];
        for (let i = 0; i < 60; i++) {
          particles.push(new Firework(fx, fy, col));
        }
      }

      particles.forEach((p, index) => {
        p.update();
        p.draw(fwCtx);
        if (p.alpha <= 0) particles.splice(index, 1);
      });

      requestAnimationFrame(loop);
    }
    loop();
  }

  // "Ha" tugmasi bosilganda
  btnYes.addEventListener("click", () => {
    overlay.hidden = false;
    setTimeout(() => overlay.classList.add("active"), 50);

    // Musiqani ijro etish
    if (romanticAudio) {
      romanticAudio.currentTime = 0;
      romanticAudio.play().catch(error => {
        console.log("Musiqani ochishda xatolik:", error);
      });
    }

    runFireworks();

    // 1. Birinchi yozuv
    setTimeout(() => {
      cineText.textContent = "Men ham sen bilan baxtliman... ❤️";
      cineText.classList.add("show");
    }, 1200);

    // Xiralashishi
    setTimeout(() => {
      cineText.classList.remove("show");
    }, 5000);

    // 2. Ikkinchi yozuv
    setTimeout(() => {
      cineText.innerHTML = "MEHR BILAN OZODBEK SEN UCHUN YARATDI ✨<br><br><span style='font-size: 0.85em; font-style: normal; font-weight: 500;'>Seni sevaman, Shahruza! 💖</span>";
      cineText.classList.add("show");
    }, 6200);

    // Xiralashishi
    setTimeout(() => {
      cineText.classList.remove("show");
    }, 11000);

    // 3. To'liq qorong'ulashish
    setTimeout(() => {
      activeFireworks = false;
      overlay.style.background = "#000";
    }, 12800);
  });
}