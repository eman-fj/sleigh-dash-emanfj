// ── CONFIG ────────────────────────────────────────────────────────────────────
const CONFIG = {
  lives: 3,
  heroSize: 0.14,
  itemSize: 0.09,
  heroKeySpeed: 1.2,
  followEase: 15,
  startFallSpeed: 0.30,
  fallSpeedStep: 0.03,
  maxFallSpeed: 0.90,
  startSpawnEvery: 0.90,
  spawnStep: 0.05,
  minSpawnEvery: 0.35,
  badWeight: 0.25,
  badStep: 0.02,
  maxBad: 0.40,
  invulnerableTime: 1.0,
  maxDt: 0.05,
  zigzagFreq:    2.5,   // full left-right cycles per second
  zigzagAmp:     0.18,  // fraction of screen width for zigzag swing
  splitFragSize: 0.065, // fragment emoji size as fraction of unit
  splitAngle:    0.55,  // radians off-vertical for outer fragments
  // dash
  dashDist:        0.25,   // fraction of screen width
  dashTime:        0.15,   // seconds to complete dash
  dashCooldown:    2.0,    // seconds before next dash
  dashDoubleTapMs: 300,    // max ms between two taps to count as double-tap
  trailLength:     6,      // number of ghost copies in trail
  trailFade:       0.55,   // opacity of first ghost (fades toward 0)
  // combo: catches needed → multiplier
  comboThresholds: [
    { at: 5,  mult: 2 },
    { at: 10, mult: 3 },
    { at: 20, mult: 5 },
  ],
  comboBannerTime: 1.8,  // seconds banner stays visible
  // reindeer
  reindeerEvery:   25,   // points per new reindeer
  maxReindeer:     4,
  reindeerBonus:   0.08, // extra catch-radius fraction per reindeer
  reindeerBannerTime: 1.6,
  powerWeight: 0.04,     // ~1-in-25 of all spawns
  magnetDuration:  5,
  cocoDuration:    5,
  cocoSpeedMult:   0.5,  // half speed during hot cocoa
  magnetRadius:    0.5,  // fraction of screen width
  magnetForce:     4,    // ease factor toward hero
  // northern lights
  auroraScore:     50,   // score at which aurora starts to appear
  auroraFadeIn:    30,   // extra points over which it fully fades in
  auroraSpeed:     0.07, // how fast the bands drift (radians per second scale)
};

// ── TEXT ──────────────────────────────────────────────────────────────────────
const TEXT = {
  title:      "🎄 Sleigh Catch 🎄",
  howTo:      "Catch 🎁 gifts and 🍪 cookies — dodge 🪨 coal!",
  start:      "Start",
  heroEmoji:  "🛷",
  score:      "Score:",
  gameOver:   "Game Over",
  finalScore: "Your score:",
  bestScore:  "Best score:",
  newBest:    "🏆 New best!",
  // postcard
  postcardGreeting: "God jul!",
  postcardGameName: "Sleigh Catch",
  postcardFile:     "sleigh-catch-postcard.png",
};

// ── BEST SCORE (localStorage) ─────────────────────────────────────────────────
function loadBest() {
  try { return parseInt(localStorage.getItem("game.best"), 10) || 0; }
  catch(e) { return 0; }
}

function saveBest(val) {
  try { localStorage.setItem("game.best", val); } catch(e) {}
}

// ── CANVAS SETUP ──────────────────────────────────────────────────────────────
const canvas = document.getElementById("game");
const ctx    = canvas.getContext("2d");
const MAX_DPR = 2;
let dpr, cssW, cssH, unit;

function resize() {
  cssW = canvas.clientWidth;
  cssH = canvas.clientHeight;
  dpr  = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  canvas.width  = cssW * dpr;
  canvas.height = cssH * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  unit = Math.min(cssW, cssH);
  buildEmojiCache();
  generateSnow();
}

window.addEventListener("resize", resize);

// ── ITEMS ─────────────────────────────────────────────────────────────────────
// Add a row to add new content. Add new code only when a new behaviour needs it.
// kind: "good" | "bad" | "power"
// movement: "straight" | "zigzag" | "fast" | "split"
const ITEMS = [
  { key: "gift",    emoji: "🎁", kind: "good",  points: 1, weight: 1.0,  speedMult: 1,   movement: "straight", minScore: 0  },
  { key: "cookie",  emoji: "🍪", kind: "good",  points: 3, weight: 0.5,  speedMult: 1,   movement: "straight", minScore: 0  },
  { key: "coal",    emoji: "🪨", kind: "bad",   points: 0, weight: null, speedMult: 1,   movement: "straight", minScore: 0  },
  { key: "icicle",  emoji: "🧊", kind: "bad",   points: 0, weight: null, speedMult: 1.8, movement: "fast",     minScore: 20 },
  { key: "snowball",emoji: "❄️", kind: "bad",   points: 0, weight: null, speedMult: 1,   movement: "zigzag",   minScore: 40 },
  { key: "cracker", emoji: "💣", kind: "bad",   points: 0, weight: null, speedMult: 1,   movement: "split",    minScore: 60 },
  { key: "magnet",  emoji: "🧲", kind: "power", points: 0, weight: null, speedMult: 1,   movement: "straight", minScore: 0  },
  { key: "shield",  emoji: "🛡️", kind: "power", points: 0, weight: null, speedMult: 1,   movement: "straight", minScore: 0  },
  { key: "coco",    emoji: "☕", kind: "power", points: 0, weight: null, speedMult: 1,   movement: "straight", minScore: 0  },
];

// ── EMOJI CACHE ───────────────────────────────────────────────────────────────
const emojiCache = {};

function makeEmojiDefs() {
  const defs = {
    hero:          { emoji: "🛷", sizeKey: "heroSize" },
    reindeer:      { emoji: "🦌", sizeKey: "heroSize" },  // same size as hero
    crackerFrag:   { emoji: "💥", sizeKey: "splitFragSize" },  // split fragment
  };
  for (const item of ITEMS) {
    defs[item.key] = { emoji: item.emoji, sizeKey: "itemSize" };
  }
  return defs;
}
const EMOJI_DEFS = makeEmojiDefs();

function buildEmojiCache() {
  for (const [key, def] of Object.entries(EMOJI_DEFS)) {
    const size = Math.round(unit * CONFIG[def.sizeKey]);
    const oc   = document.createElement("canvas");
    oc.width   = size * MAX_DPR;
    oc.height  = size * MAX_DPR;
    const oc2  = oc.getContext("2d");
    oc2.font          = `${size * MAX_DPR}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    oc2.textAlign     = "center";
    oc2.textBaseline  = "middle";
    oc2.fillText(def.emoji, oc.width / 2, oc.height / 2);
    emojiCache[key] = { canvas: oc, size };
  }
}

function drawEmoji(key, cx, cy) {
  const cached = emojiCache[key];
  if (!cached) return;
  const { canvas: img, size } = cached;
  ctx.drawImage(img, cx - size / 2, cy - size / 2, size, size);
}

// ── FACE HERO ─────────────────────────────────────────────────────────────────
// Canvas layout (FACE_SIZE wide, FACE_CANVAS_H tall):
//
//   ┌──────────────┐  ← top of canvas
//   │  /\  hat     │  drawn hat (canvas primitives, no face emoji)
//   │ /  \ trim    │
//   │╭────╮        │
//   ││photo│       │  circle in bottom portion
//   │╰────╯        │
//   └──────────────┘
//
// In the game loop the face is drawn SMALLER than the sleigh (FACE_DRAW_FRAC)
// and floats above it.

const FACE_SIZE      = 128;    // circle diameter in the offscreen canvas (px)
const FACE_LS_KEY    = "game.face";
// Hat zone must fit: hatW(0.78)*1.27 ≈ 100px above the circle, plus pompom padding at top
const FACE_HAT_FRAC  = 1.00;   // hat zone height relative to FACE_SIZE
const FACE_CANVAS_H  = Math.round(FACE_SIZE * (1 + FACE_HAT_FRAC));
const FACE_DRAW_FRAC = 0.62;   // face drawn at this fraction of hSize (smaller than sleigh)

let faceCanvas = null;   // null = use normal hero emoji

// Draw a Santa hat using canvas primitives (no emoji, no face).
// cx = centre-x, tipY = y of the hat tip, hatW = total width of brim.
function drawHatPrimitives(c, cx, tipY, hatW) {
  const trimH  = hatW * 0.22;   // height of the white band
  const trimY  = tipY + hatW * 1.05;  // top of trim band
  const halfW  = hatW / 2;

  // Red cone body
  c.beginPath();
  c.moveTo(cx, tipY);                        // tip
  c.lineTo(cx - halfW, trimY + trimH * 0.3); // bottom-left of cone
  c.lineTo(cx + halfW, trimY + trimH * 0.3); // bottom-right of cone
  c.closePath();
  c.fillStyle = "#c0392b";
  c.fill();

  // White pompom at tip
  const pomR = hatW * 0.14;
  c.beginPath();
  c.arc(cx, tipY + pomR * 0.5, pomR, 0, Math.PI * 2);
  c.fillStyle = "#ffffff";
  c.fill();

  // White trim band (rounded pill)
  c.beginPath();
  c.roundRect
    ? c.roundRect(cx - halfW * 1.08, trimY, halfW * 2.16, trimH, trimH / 2)
    : (function() {
        const r = trimH / 2;
        c.arc(cx - halfW * 1.08 + r, trimY + r, r, Math.PI, 0, true);
        c.arc(cx + halfW * 1.08 - r, trimY + r, r, 0, Math.PI, true);
        c.closePath();
      })();
  c.fillStyle = "#f0f0f0";
  c.fill();
}

// Build the face+hat canvas from a photo img element.
function buildFaceCanvas(img) {
  const oc  = document.createElement("canvas");
  oc.width  = FACE_SIZE;
  oc.height = FACE_CANVAS_H;
  const c   = oc.getContext("2d");

  const circleR  = FACE_SIZE / 2;
  const circleCY = FACE_CANVAS_H - circleR;  // circle bottom flush with canvas bottom

  // 1 — circle-clip the photo
  c.save();
  c.beginPath();
  c.arc(FACE_SIZE / 2, circleCY, circleR, 0, Math.PI * 2);
  c.clip();
  const scale = Math.max(FACE_SIZE / img.naturalWidth, FACE_SIZE / img.naturalHeight);
  const sw    = img.naturalWidth  * scale;
  const sh    = img.naturalHeight * scale;
  c.drawImage(img,
    (FACE_SIZE - sw) / 2,
    circleCY - circleR + (FACE_SIZE - sh) / 2,
    sw, sh);
  c.restore();

  // 2 — draw hat so its brim sits just above the circle top, tiny overlap only.
  // Hat is intentionally narrower than the circle (45% of diameter).
  const hatW       = FACE_SIZE * 0.45;         // brim width — smaller than the photo
  const trimH      = hatW * 0.22;              // must match drawHatPrimitives
  const overlapPx  = FACE_SIZE * 0.06;         // tiny overlap into circle top
  const circleTop  = circleCY - circleR;
  // trimY + trimH = circleTop + overlapPx  →  trimY = circleTop + overlapPx - trimH
  const trimY      = circleTop + overlapPx - trimH;
  // tipY + hatW * 1.05 = trimY  →  tipY = trimY - hatW * 1.05
  const hatTipY    = trimY - hatW * 1.05;
  drawHatPrimitives(c, FACE_SIZE / 2, hatTipY, hatW);

  return oc;
}

// Load a data-URL string → HTMLImageElement, then call buildFaceCanvas.
function loadFaceFromDataURL(dataURL) {
  const img = new Image();
  img.onload = function() {
    faceCanvas = buildFaceCanvas(img);
    setFaceUI(true);
  };
  img.onerror = function() {
    faceCanvas = null;
    setFaceUI(false);
  };
  img.src = dataURL;
}

// Persist face to localStorage (the data never leaves the device).
function saveFaceToStorage(dataURL) {
  try { localStorage.setItem(FACE_LS_KEY, dataURL); } catch(e) {}
}

function removeFaceFromStorage() {
  try { localStorage.removeItem(FACE_LS_KEY); } catch(e) {}
}

function loadFaceFromStorage() {
  try {
    const stored = localStorage.getItem(FACE_LS_KEY);
    if (stored) loadFaceFromDataURL(stored);
  } catch(e) {}
}

// Show/hide the "Remove my face" button and privacy note.
function setFaceUI(hasFace) {
  const removeBtn = document.getElementById("remove-face-btn");
  const note      = document.getElementById("face-note");
  if (removeBtn) removeBtn.classList.toggle("hidden", !hasFace);
  if (note)      note.classList.toggle("hidden", !hasFace);
}

// File input → read as data-URL → shrink to FACE_SIZE → store.
document.getElementById("face-input").addEventListener("change", function(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    // Shrink to FACE_SIZE before storing so the data-URL stays small.
    const rawImg = new Image();
    rawImg.onload = function() {
      // Draw into a temporary canvas at exactly FACE_SIZE × FACE_SIZE.
      const tmp   = document.createElement("canvas");
      tmp.width   = FACE_SIZE;
      tmp.height  = FACE_SIZE;
      const tc    = tmp.getContext("2d");
      const scale = Math.max(FACE_SIZE / rawImg.naturalWidth, FACE_SIZE / rawImg.naturalHeight);
      const sw    = rawImg.naturalWidth  * scale;
      const sh    = rawImg.naturalHeight * scale;
      tc.drawImage(rawImg, (FACE_SIZE - sw) / 2, (FACE_SIZE - sh) / 2, sw, sh);
      const smallDataURL = tmp.toDataURL("image/jpeg", 0.82);
      saveFaceToStorage(smallDataURL);
      loadFaceFromDataURL(smallDataURL);
    };
    rawImg.src = evt.target.result;
  };
  reader.readAsDataURL(file);
  // Reset so picking the same file again still fires "change".
  e.target.value = "";
});

document.getElementById("remove-face-btn").addEventListener("click", function() {
  faceCanvas = null;
  removeFaceFromStorage();
  setFaceUI(false);
});

// On page load, restore any saved face.
loadFaceFromStorage();

// ── STARS ─────────────────────────────────────────────────────────────────────
const STAR_COUNT = 80;
let stars = [];

function generateStars() {
  stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random(),
      y: Math.random() * 0.85,
      r: Math.random() * 1.5 + 0.5,
      a: Math.random() * 0.6 + 0.4,
    });
  }
}

// ── SNOW ──────────────────────────────────────────────────────────────────────
let snowFlakes = [];

function generateSnow() {
  // 30 flakes on narrow screens (phones), 60 on wider ones (laptops/tablets)
  const count = cssW < 600 ? 30 : 60;
  snowFlakes = [];
  for (let i = 0; i < count; i++) {
    snowFlakes.push({
      x:          Math.random(),          // 0–1 fraction of cssW
      y:          Math.random(),          // 0–1 fraction of cssH (pre-scattered)
      r:          Math.random() * 2 + 1,  // 1–3 px radius
      speed:      Math.random() * 0.04 + 0.02,  // fall speed as fraction of cssH/s
      drift:      Math.random() * 0.012 + 0.004, // sideways sine amplitude (fraction of cssW)
      driftFreq:  Math.random() * 0.5 + 0.3,    // cycles per second
      driftPhase: Math.random() * Math.PI * 2,   // individual starting phase
      alpha:      Math.random() * 0.5 + 0.4,     // 0.4–0.9 opacity
    });
  }
}

let snowTime = 0;  // accumulates dt; drives drift sine

function updateSnow(dt) {
  snowTime += dt;
  for (const f of snowFlakes) {
    f.y += f.speed * dt;
    // gentle sideways drift via sine wave
    f.x += Math.sin(snowTime * f.driftFreq * Math.PI * 2 + f.driftPhase)
           * f.drift * dt;
    // wrap vertically
    if (f.y > 1) { f.y = -f.r / cssH; f.x = Math.random(); }
    // wrap horizontally
    if (f.x < 0) f.x = 1;
    if (f.x > 1) f.x = 0;
  }
}

function drawSnow() {
  ctx.save();
  for (const f of snowFlakes) {
    ctx.globalAlpha = f.alpha;
    ctx.fillStyle   = "#ffffff";
    ctx.beginPath();
    ctx.arc(f.x * cssW, f.y * cssH, f.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ── NORTHERN LIGHTS ───────────────────────────────────────────────────────────
let auroraTime = 0;   // advances every frame; drives the wave animation

// Three bands: each has a base Y (fraction of screen height), colour, and
// individual phase offsets so they move independently.
const AURORA_BANDS = [
  { yBase: 0.18, color: "0,230,120",  phase: 0.0,  waveAmp: 0.055, waveFreq: 1.3 },
  { yBase: 0.30, color: "120,80,255", phase: 1.8,  waveAmp: 0.040, waveFreq: 1.7 },
  { yBase: 0.10, color: "0,200,180",  phase: 3.5,  waveAmp: 0.065, waveFreq: 1.1 },
];

function drawAurora(masterAlpha) {
  if (masterAlpha <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";  // additive glow on dark sky

  for (const band of AURORA_BANDS) {
    const bandH = cssH * 0.13;   // height of each band
    const steps = 24;            // horizontal segments to make the wave
    const segW  = cssW / steps;

    for (let s = 0; s <= steps; s++) {
      const px = s * segW;
      // vertical wobble: sin of (position + time + phase)
      const wave = Math.sin(s * 0.4 + auroraTime * CONFIG.auroraSpeed * Math.PI * 2 * band.waveFreq + band.phase)
                   * band.waveAmp;
      const cy   = (band.yBase + wave) * cssH;

      const grad = ctx.createLinearGradient(0, cy - bandH, 0, cy + bandH);
      grad.addColorStop(0,   `rgba(${band.color},0)`);
      grad.addColorStop(0.4, `rgba(${band.color},${0.22 * masterAlpha})`);
      grad.addColorStop(0.5, `rgba(${band.color},${0.30 * masterAlpha})`);
      grad.addColorStop(0.6, `rgba(${band.color},${0.22 * masterAlpha})`);
      grad.addColorStop(1,   `rgba(${band.color},0)`);

      ctx.fillStyle = grad;
      ctx.fillRect(px, cy - bandH, segW + 1, bandH * 2);
    }
  }

  ctx.restore();
}

function drawSky() {
  const grad = ctx.createLinearGradient(0, 0, 0, cssH);
  grad.addColorStop(0, "#0d1b4b");
  grad.addColorStop(1, "#1a3a6b");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, cssW, cssH);

  // Northern lights (fade in after auroraScore points; score may be undefined on start screen)
  const auroraAlpha = Math.min(1, Math.max(0,
    ((score || 0) - CONFIG.auroraScore) / CONFIG.auroraFadeIn
  ));
  drawAurora(auroraAlpha);

  // Snow sits behind stars so stars appear to shine through it
  drawSnow();

  for (const s of stars) {
    ctx.globalAlpha = s.a;
    ctx.fillStyle   = "#ffffff";
    ctx.beginPath();
    ctx.arc(s.x * cssW, s.y * cssH, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ── GAME STATE ────────────────────────────────────────────────────────────────
let running = false;
let score, lives, invTimer, blinkPhase;
let roundTime = 0;   // seconds elapsed in the current round
let streak, comboMult;   // consecutive good catches and current multiplier
let reindeer;            // 0–4 reindeer running ahead of the sleigh
let items;               // array of falling items
let spawnTimer;          // accumulator for next spawn
let heroX;               // centre-x in CSS pixels
let targetX;             // where pointer/touch wants the hero
let lastMoveDir = 1;     // last horizontal direction (+1 right, -1 left) for dash

// effects: name → { timeLeft, duration }
// active effects act in their own named place in the code (see POWER-UP EFFECTS)
const effects = {};

// ── DASH STATE ────────────────────────────────────────────────────────────────
let dashTimer    = 0;   // > 0 means actively dashing, counts down
let dashCooldown = 0;   // counts down after a dash
let dashDir      = 1;   // direction of current/last dash
let dashTrail    = [];  // [{x, age}] ghost positions, age 0..1

function heroY() {
  return cssH - unit * CONFIG.heroSize * 1.0;
}

function clampHero(x) {
  const half = unit * CONFIG.heroSize / 2;
  return Math.max(half, Math.min(cssW - half, x));
}

function tryDash(dir) {
  if (!running) return;
  if (dashTimer > 0 || dashCooldown > 0) return;  // already dashing or cooling
  dashDir    = dir;
  dashTimer  = CONFIG.dashTime;
  dashCooldown = CONFIG.dashCooldown;
  dashTrail  = [];
}

// ── REINDEER ──────────────────────────────────────────────────────────────────
// Catch radius grows with each reindeer
function catchRadius() {
  return unit * CONFIG.heroSize * 0.45 * (1 + reindeer * CONFIG.reindeerBonus);
}

// Call after score changes to award new reindeer
function checkReindeer() {
  const earned = Math.min(
    Math.floor(score / CONFIG.reindeerEvery),
    CONFIG.maxReindeer
  );
  if (earned > reindeer) {
    reindeer = earned;
    showComboBanner("🦌 +1 reindeer: wider gift catch!");
    updateHUD();
  }
}

// Lose one reindeer on a bad hit
function loseReindeer() {
  if (reindeer > 0) reindeer -= 1;
}

// ── CONTROLS ──────────────────────────────────────────────────────────────────
const keys = {};
let lastTapTime = 0;
let lastTapX    = 0;

document.addEventListener("keydown", function(e) {
  keys[e.code] = true;
  if ((e.code === "Space" || e.code === "Enter") && !running) startGame();
  // Space during play = dash in last movement direction
  if (e.code === "Space" && running) {
    tryDash(lastMoveDir);
  }
  if (["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"," "].includes(e.key)) {
    e.preventDefault();
  }
});

document.addEventListener("keyup", function(e) {
  keys[e.code] = false;
});

canvas.addEventListener("pointermove", function(e) {
  if (!running) return;
  const rect = canvas.getBoundingClientRect();
  targetX = e.clientX - rect.left;
});

canvas.addEventListener("pointerdown", function(e) {
  if (!running) return;
  const rect = canvas.getBoundingClientRect();
  const tapX = e.clientX - rect.left;
  targetX = tapX;
  canvas.setPointerCapture(e.pointerId);

  // Double-tap detection for dash
  const now = performance.now();
  if (now - lastTapTime < CONFIG.dashDoubleTapMs) {
    // direction: toward the tap relative to hero centre
    const dir = tapX < heroX ? -1 : 1;
    tryDash(dir);
    lastTapTime = 0;  // consume the double-tap
  } else {
    lastTapTime = now;
    lastTapX    = tapX;
  }
});

function updateHero(dt) {
  if (!running) return;

  // ── Active dash ──
  if (dashTimer > 0) {
    const progress = 1 - dashTimer / CONFIG.dashTime;  // 0→1
    const speed    = CONFIG.dashDist * cssW / CONFIG.dashTime;
    // push trail ghost at current position
    if (dashTrail.length < CONFIG.trailLength) {
      dashTrail.push({ x: heroX, age: 0 });
    }
    heroX     = clampHero(heroX + dashDir * speed * dt);
    targetX   = heroX;
    dashTimer = Math.max(0, dashTimer - dt);
    return;  // skip normal movement while dashing
  }

  // Age out trail after dash ends
  for (let i = dashTrail.length - 1; i >= 0; i--) {
    dashTrail[i].age += dt / 0.25;  // fade over 0.25 s
    if (dashTrail[i].age >= 1) dashTrail.splice(i, 1);
  }

  // ── Normal movement ──
  let keyDir = 0;
  if (keys["ArrowLeft"]  || keys["KeyA"]) keyDir -= 1;
  if (keys["ArrowRight"] || keys["KeyD"]) keyDir += 1;

  if (keyDir !== 0) {
    heroX       = clampHero(heroX + keyDir * CONFIG.heroKeySpeed * cssW * dt);
    targetX     = heroX;
    lastMoveDir = keyDir;
  } else if (targetX !== undefined) {
    const dx = targetX - heroX;
    if (Math.abs(dx) > 2) lastMoveDir = dx > 0 ? 1 : -1;
    heroX = clampHero(heroX + dx * Math.min(1, dt * CONFIG.followEase));
  }
}

// ── LEVEL / SPEED ─────────────────────────────────────────────────────────────
function getLevel() {
  return Math.floor(score / 10);
}

function baseFallSpeed() {
  return Math.min(
    CONFIG.startFallSpeed + getLevel() * CONFIG.fallSpeedStep,
    CONFIG.maxFallSpeed
  );
}

function fallSpeed() {
  // Hot cocoa slows everything down
  if (effects.coco) return baseFallSpeed() * CONFIG.cocoSpeedMult;
  return baseFallSpeed();
}

function spawnEvery() {
  return Math.max(
    CONFIG.startSpawnEvery - getLevel() * CONFIG.spawnStep,
    CONFIG.minSpawnEvery
  );
}

function badWeight() {
  return Math.min(
    CONFIG.badWeight + getLevel() * CONFIG.badStep,
    CONFIG.maxBad
  );
}

// ── SPAWNING ──────────────────────────────────────────────────────────────────
function spawnItem() {
  const bw = badWeight();
  const pw = CONFIG.powerWeight;
  const gw = 1 - bw - pw;  // remaining weight split among good items

  // Count eligible bad items (those whose minScore has been reached)
  const eligibleBad = ITEMS.filter(function(t) { return t.kind === "bad" && score >= t.minScore; });
  const badShare    = eligibleBad.length > 0 ? bw / eligibleBad.length : 0;

  const pool = [];
  for (const t of ITEMS) {
    if (t.kind === "bad") {
      if (score < t.minScore) continue;  // not unlocked yet
      pool.push({ type: t, w: badShare });
    } else if (t.kind === "power") {
      pool.push({ type: t, w: pw / 3 });  // equal share among 3 power-ups
    } else {
      pool.push({ type: t, w: gw * t.weight });
    }
  }

  const total = pool.reduce(function(s, p) { return s + p.w; }, 0);
  let r = Math.random() * total;
  let chosen = pool[0].type;
  for (const p of pool) {
    r -= p.w;
    if (r <= 0) { chosen = p.type; break; }
  }

  items.push({
    type:     chosen,
    x:        Math.random() * (cssW - unit * CONFIG.itemSize) + unit * CONFIG.itemSize / 2,
    y:        -unit * CONFIG.itemSize / 2,
    zigTimer: 0,          // used by zigzag: accumulates time for sin()
    split:    false,      // cracker: becomes true once it has split
    frags:    null,       // cracker: array of {x,y,vx,vy} once split
  });
}

// ── POWER-UP EFFECTS ──────────────────────────────────────────────────────────
// Each effect has one clear place it acts:
//   magnet  → updateItems() drifts good items toward hero
//   shield  → checkCollisions() blocks first bad hit
//   coco    → fallSpeed() halves the return value

function activatePower(key) {
  if (key === "magnet") {
    effects.magnet = { timeLeft: CONFIG.magnetDuration, duration: CONFIG.magnetDuration };
  } else if (key === "shield") {
    // shield has no timer — lasts until used; store a truthy sentinel
    effects.shield = { timeLeft: Infinity, duration: Infinity };
  } else if (key === "coco") {
    effects.coco = { timeLeft: CONFIG.cocoDuration, duration: CONFIG.cocoDuration };
  }
  updatePowerHUD();
}

// ── COLLISION ─────────────────────────────────────────────────────────────────
function applyBadHit() {
  if (invTimer > 0) return;
  if (effects.shield) {
    delete effects.shield;
    updatePowerHUD();
  } else {
    lives -= 1;
    loseReindeer();
    invTimer   = CONFIG.invulnerableTime;
    blinkPhase = 0;
    resetStreak();
    navigator.vibrate?.(120);
    playThud();
    updateHUD();
    if (lives <= 0) endGame();
  }
}

function checkCollisions() {
  const goodR = catchRadius();              // enlarged by reindeer — good/power catches only
  const badR  = unit * CONFIG.heroSize * 0.45;  // base hero radius — bad items always
  const itemR = unit * CONFIG.itemSize * 0.45;
  const fragR = unit * CONFIG.splitFragSize * 0.45;
  const hy    = heroY();

  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];

    // ── Cracker fragments collision — always use base hero radius ──
    if (item.type.movement === "split" && item.split && item.frags) {
      for (let f = item.frags.length - 1; f >= 0; f--) {
        const frag = item.frags[f];
        const dx = frag.x - heroX;
        const dy = frag.y - hy;
        if (Math.sqrt(dx * dx + dy * dy) < badR + fragR) {
          item.frags.splice(f, 1);
          applyBadHit();
          if (lives <= 0) return;  // endGame was called
        }
      }
      continue;  // don't test parent item while split
    }

    // Bad items use base radius; good/power items use the widened radius
    const heroR = item.type.kind === "bad" ? badR : goodR;
    const dx = item.x - heroX;
    const dy = item.y - hy;
    if (Math.sqrt(dx * dx + dy * dy) < heroR + itemR) {
      items.splice(i, 1);

      if (item.type.kind === "bad") {
        applyBadHit();
        if (lives <= 0) return;
      } else if (item.type.kind === "power") {
        activatePower(item.type.key);
      } else {
        score += item.type.points * comboMult;
        playBlip();
        checkReindeer();
        applyStreak();
        updateHUD();
      }
    }
  }
}

// ── UPDATE ITEMS ──────────────────────────────────────────────────────────────
function updateItems(dt) {
  const baseSpeed = fallSpeed() * cssH;
  const magnetOn  = !!effects.magnet;
  const magnetR   = CONFIG.magnetRadius * cssW;
  const hy        = heroY();

  for (let i = items.length - 1; i >= 0; i--) {
    const item  = items[i];
    const speed = baseSpeed * item.type.speedMult;

    // ── Cracker split: once split, move fragments independently ──
    if (item.type.movement === "split" && item.split && item.frags) {
      let allGone = true;
      for (const f of item.frags) {
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        if (f.y <= cssH + unit * CONFIG.splitFragSize) allGone = false;
      }
      if (allGone) items.splice(i, 1);
      continue;  // skip normal movement
    }

    // Magnet: drift good items toward hero horizontally
    if (magnetOn && item.type.kind === "good") {
      const dx = heroX - item.x;
      if (Math.abs(dx) < magnetR) {
        item.x += dx * Math.min(1, dt * CONFIG.magnetForce);
      }
    }

    // ── Movement types ──
    if (item.type.movement === "zigzag") {
      item.zigTimer += dt;
      item.x += Math.cos(item.zigTimer * CONFIG.zigzagFreq * Math.PI * 2) *
                CONFIG.zigzagAmp * cssW * dt * CONFIG.zigzagFreq * Math.PI * 2;
      item.x = Math.max(unit * CONFIG.itemSize / 2,
               Math.min(cssW - unit * CONFIG.itemSize / 2, item.x));
    }

    item.y += speed * dt;

    // ── Cracker split trigger at halfway ──
    if (item.type.movement === "split" && !item.split && item.y >= cssH * 0.5) {
      item.split = true;
      const angle = CONFIG.splitAngle;
      item.frags = [
        { x: item.x, y: item.y, vx: 0,                 vy: speed * 1.1 },
        { x: item.x, y: item.y, vx:  Math.sin(angle) * speed, vy: Math.cos(angle) * speed },
        { x: item.x, y: item.y, vx: -Math.sin(angle) * speed, vy: Math.cos(angle) * speed },
      ];
    }

    if (item.y > cssH + unit * CONFIG.itemSize) {
      if (item.type.kind !== "bad") resetStreak();  // missed good/power resets streak
      items.splice(i, 1);
    }
  }
}

// ── COMBO ─────────────────────────────────────────────────────────────────────
const comboBanner = document.getElementById("combo-banner");
const hudCombo    = document.getElementById("hud-combo");

function comboMultiplierFor(s) {
  let m = 1;
  for (const t of CONFIG.comboThresholds) {
    if (s >= t.at) m = t.mult;
  }
  return m;
}

function applyStreak() {
  streak += 1;
  const newMult = comboMultiplierFor(streak);
  if (newMult > comboMult) {
    comboMult = newMult;
    showComboBanner("COMBO x" + comboMult + "!");
  }
}

function resetStreak() {
  streak    = 0;
  comboMult = 1;
  updateHUD();
}

function showComboBanner(text) {
  comboBanner.textContent = text;
  effects.comboBanner = { timeLeft: CONFIG.comboBannerTime, duration: CONFIG.comboBannerTime };
  if (window.gsap) {
    gsap.killTweensOf(comboBanner);
    // Scale in sharply, hold, then fade out toward the end
    gsap.fromTo(comboBanner,
      { scale: 0.4, autoAlpha: 1 },
      { scale: 1,   autoAlpha: 1, duration: 0.22, ease: "back.out(3)",
        onComplete: function() {
          gsap.to(comboBanner, { autoAlpha: 0, duration: 0.35,
            delay: CONFIG.comboBannerTime - 0.57 });
        }
      }
    );
  } else {
    // CSS fallback: remove class, reflow, re-add
    comboBanner.classList.remove("combo-anim");
    void comboBanner.offsetWidth;
    comboBanner.classList.add("combo-anim");
  }
}

// ── HUD ───────────────────────────────────────────────────────────────────────
const hudScore     = document.getElementById("hud-score");
const hudLives     = document.getElementById("hud-lives");
const hudReindeer  = document.getElementById("hud-reindeer");
let _lastDisplayedScore = 0;  // used to detect when score actually changes

function updateHUD() {
  hudLives.textContent = "❤️".repeat(Math.max(0, lives));
  if (comboMult > 1) {
    hudCombo.textContent = "x" + comboMult;
    hudCombo.style.display = "";
  } else {
    hudCombo.style.display = "none";
  }
  if (reindeer > 0) {
    hudReindeer.textContent = "🦌×" + reindeer;
    hudReindeer.style.display = "";
  } else {
    hudReindeer.style.display = "none";
  }
  if (score !== _lastDisplayedScore) {
    _lastDisplayedScore = score;
    hudScore.textContent = TEXT.score + " " + score;
    // Score pop: scale up briefly then snap back
    if (window.gsap) {
      gsap.killTweensOf(hudScore);
      gsap.fromTo(hudScore, { scale: 1.45 }, { scale: 1, duration: 0.25, ease: "back.out(2)" });
    }
  } else {
    hudScore.textContent = TEXT.score + " " + score;
  }
}

// ── POWER HUD ─────────────────────────────────────────────────────────────────
const powerHud = document.getElementById("power-hud");

function updatePowerHUD() {
  powerHud.innerHTML = "";
  const order = ["magnet", "shield", "coco"];
  const icons  = { magnet: "🧲", shield: "🛡️", coco: "☕" };
  for (const name of order) {
    if (!effects[name]) continue;
    const ef = effects[name];
    const wrap = document.createElement("div");
    wrap.className = "power-slot";

    const icon = document.createElement("span");
    icon.textContent = icons[name];
    wrap.appendChild(icon);

    if (ef.duration !== Infinity) {
      const bar = document.createElement("div");
      bar.className = "power-bar-bg";
      const fill = document.createElement("div");
      fill.className = "power-bar-fill";
      fill.style.width = Math.max(0, (ef.timeLeft / ef.duration) * 100) + "%";
      bar.appendChild(fill);
      wrap.appendChild(bar);
    } else {
      // Shield: show a small static bar at full
      const bar = document.createElement("div");
      bar.className = "power-bar-bg";
      const fill = document.createElement("div");
      fill.className = "power-bar-fill power-bar-shield";
      fill.style.width = "100%";
      bar.appendChild(fill);
      wrap.appendChild(bar);
    }

    powerHud.appendChild(wrap);
  }
}

// ── DRAW FRAME ────────────────────────────────────────────────────────────────
function draw() {
  drawSky();
  if (!running) return;

  // Draw items
  for (const item of items) {
    if (item.type.movement === "split" && item.split && item.frags) {
      // Draw fragments instead of the parent cracker
      for (const f of item.frags) {
        drawEmoji("crackerFrag", f.x, f.y);
      }
    } else {
      drawEmoji(item.type.key, item.x, item.y);
    }
  }

  const hy      = heroY();
  const hSize   = unit * CONFIG.heroSize;

  // Dash trail: ghost copies fading out behind hero
  if (dashTrail.length > 0) {
    const trailEmoji = emojiCache["hero"] && emojiCache["hero"].canvas;
    for (let i = 0; i < dashTrail.length; i++) {
      const ghost  = dashTrail[i];
      const frac   = 1 - ghost.age;
      const alpha  = frac * CONFIG.trailFade * (i / CONFIG.trailLength + 0.3);
      ctx.save();
      ctx.globalAlpha = Math.min(1, alpha);
      if (faceCanvas) {
        // Match the same sizing as the hero draw
        const faceDrawW = hSize * FACE_DRAW_FRAC;
        const faceDrawH = faceDrawW * (FACE_CANVAS_H / FACE_SIZE);
        const faceTop   = hy - hSize * 0.15 - faceDrawH;
        ctx.drawImage(faceCanvas, ghost.x - faceDrawW / 2, faceTop, faceDrawW, faceDrawH);
      } else if (trailEmoji) {
        ctx.drawImage(trailEmoji, ghost.x - hSize / 2, hy - hSize / 2, hSize, hSize);
      }
      ctx.restore();
    }
  }

  // Dash cooldown ring under hero (only when cooling down, not while dashing)
  if (dashCooldown > 0 && dashTimer <= 0) {
    const ringR   = hSize * 0.62;
    const ringY   = hy + hSize * 0.52;
    const filled  = 1 - dashCooldown / CONFIG.dashCooldown;  // 0→1 as it refills
    ctx.save();
    ctx.lineWidth   = Math.max(2, unit * 0.006);
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.beginPath();
    ctx.arc(heroX, ringY, ringR, 0, Math.PI * 2);
    ctx.stroke();
    if (filled > 0) {
      ctx.strokeStyle = "#f5c518";
      ctx.shadowColor = "#f5c518";
      ctx.shadowBlur  = 8;
      ctx.beginPath();
      ctx.arc(heroX, ringY, ringR, -Math.PI / 2, -Math.PI / 2 + filled * Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Shield ring around hero
  if (effects.shield) {
    const r = hSize * 0.6;
    ctx.save();
    ctx.strokeStyle = "#a8e6ff";
    ctx.lineWidth   = 3;
    ctx.shadowColor = "#a8e6ff";
    ctx.shadowBlur  = 14;
    ctx.globalAlpha = 0.85 + 0.15 * Math.sin(Date.now() / 200);
    ctx.beginPath();
    ctx.arc(heroX, hy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Draw reindeer in a line to the left of the hero (they pull the sleigh)
  if (reindeer > 0) {
    const spacing = hSize * 0.85;
    for (let r = 0; r < reindeer; r++) {
      drawEmoji("reindeer", heroX - spacing * (r + 1), hy);
    }
  }

  // Draw hero (blink when invulnerable)
  const showHero = invTimer <= 0 || (Math.floor(blinkPhase / 0.1) % 2 === 0);
  if (showHero) {
    // Always draw the sleigh emoji as the base
    drawEmoji("hero", heroX, hy);
    if (faceCanvas) {
      // Draw smaller than the sleigh and float above it.
      const faceDrawW = hSize * FACE_DRAW_FRAC;
      const faceDrawH = faceDrawW * (FACE_CANVAS_H / FACE_SIZE);
      // Bottom of the circle sits just above the sleigh centre
      const faceTop   = hy - hSize * 0.15 - faceDrawH;
      ctx.drawImage(faceCanvas, heroX - faceDrawW / 2, faceTop, faceDrawW, faceDrawH);
    }
  }
}

// ── LOOP ──────────────────────────────────────────────────────────────────────
let lastTime = null;

function loop(ts) {
  if (lastTime === null) lastTime = ts;
  const dt = Math.min((ts - lastTime) / 1000, CONFIG.maxDt);
  lastTime = ts;

  auroraTime += dt;   // always advance so bands are already moving when they appear
  updateSnow(dt);     // snow falls on start screen, during play, and at game over

  if (running) {
    roundTime += dt;

    // Dash cooldown countdown
    if (dashCooldown > 0) dashCooldown = Math.max(0, dashCooldown - dt);

    updateHero(dt);
    updateItems(dt);

    // Count down active effects
    let powerChanged = false;
    for (const name in effects) {
      if (name === "shield") continue;  // shield has no timer
      effects[name].timeLeft -= dt;
      if (effects[name].timeLeft <= 0) {
        delete effects[name];
        if (name === "comboBanner") {
          comboBanner.classList.remove("combo-anim");
        } else {
          powerChanged = true;
        }
      }
    }
    if (powerChanged) updatePowerHUD();

    // Invulnerability timer & blink
    if (invTimer > 0) {
      invTimer   -= dt;
      blinkPhase += dt;
    }

    // Spawn
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnItem();
      spawnTimer = spawnEvery();
    }

    checkCollisions();

    // Live-update power HUD timer bars every frame
    updatePowerHUD();
  }

  draw();
  requestAnimationFrame(loop);
}

// ── GAME OVER ─────────────────────────────────────────────────────────────────
const gameoverScreen = document.getElementById("gameover-screen");
const goScore        = document.getElementById("go-score");
const goBest         = document.getElementById("go-best");
const goNewBest      = document.getElementById("go-new-best");
const replayBtn      = document.getElementById("replay-btn");
const postcardBtn    = document.getElementById("postcard-btn");

// Rank from leaderboard (null when no leaderboard is integrated yet)
let lastRank = null;
// Score at game-over (captured so postcard can use it even after score resets)
let postcardScore = 0;

function endGame() {
  running = false;
  document.getElementById("hud").classList.add("hidden");
  powerHud.classList.add("hidden");

  const prev  = loadBest();
  const isNew = score > prev;
  const best  = isNew ? score : prev;
  if (isNew) saveBest(best);

  postcardScore = score;

  goScore.textContent   = TEXT.finalScore + " " + score;
  goBest.textContent    = TEXT.bestScore  + " " + best;
  goNewBest.classList.toggle("hidden", !isNew);
  window.Leaderboard?.submit(score, Math.max(3, Math.round(roundTime)));
  gameoverScreen.classList.remove("hidden");
  playGameOver();

  if (window.gsap) {
    gsap.killTweensOf(gameoverScreen);
    gsap.fromTo(gameoverScreen,
      { y: 80, autoAlpha: 0 },
      { y: 0,  autoAlpha: 1, duration: 0.45, ease: "power3.out" }
    );
  }
}

replayBtn.addEventListener("click", startGame);

// ── POSTCARD ──────────────────────────────────────────────────────────────────
function drawPostcard() {
  // Card dimensions: classic 4:3 landscape postcard
  const W = 900, H = 630;
  const oc  = document.createElement("canvas");
  oc.width  = W;
  oc.height = H;
  const c   = oc.getContext("2d");

  // --- background gradient (deep night sky) ---
  const bg = c.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0d1b4b");
  bg.addColorStop(1, "#0a1230");
  c.fillStyle = bg;
  c.fillRect(0, 0, W, H);

  // --- stars ---
  c.fillStyle = "#ffffff";
  for (let i = 0; i < 90; i++) {
    const sx = (Math.sin(i * 137.5) * 0.5 + 0.5) * W;
    const sy = (Math.sin(i * 97.3)  * 0.5 + 0.5) * H * 0.75;
    const sr = Math.sin(i * 61.7)   * 0.9 + 1.1;
    c.globalAlpha = Math.sin(i * 43.1) * 0.3 + 0.65;
    c.beginPath();
    c.arc(sx, sy, sr, 0, Math.PI * 2);
    c.fill();
  }
  c.globalAlpha = 1;

  // --- snow on ground (white hill) ---
  c.fillStyle = "#e8f4ff";
  c.beginPath();
  c.moveTo(0, H);
  c.bezierCurveTo(W * 0.25, H * 0.78, W * 0.75, H * 0.80, W, H * 0.76);
  c.lineTo(W, H);
  c.closePath();
  c.fill();

  // --- gold border ---
  const borderW = 10;
  c.strokeStyle = "#f5c518";
  c.lineWidth   = borderW;
  c.strokeRect(borderW / 2, borderW / 2, W - borderW, H - borderW);

  // inner thin border
  c.strokeStyle = "rgba(245,197,24,0.4)";
  c.lineWidth   = 2;
  c.strokeRect(borderW + 6, borderW + 6, W - (borderW + 6) * 2, H - (borderW + 6) * 2);

  // --- game name (top-centre) ---
  c.fillStyle  = "#f5c518";
  c.font       = "bold 44px 'Mountains of Christmas', 'Georgia', serif";
  c.textAlign  = "center";
  c.textBaseline = "top";
  c.fillText(TEXT.postcardGameName, W / 2, 30);

  // --- hero (face photo or emoji, large, left side) ---
  if (faceCanvas) {
    const faceW = 160, faceH = 160;
    c.drawImage(faceCanvas, W * 0.25 - faceW / 2, H * 0.47 - faceH / 2, faceW, faceH);
  } else {
    const heroFontSize = 130;
    c.font          = heroFontSize + "px \"Apple Color Emoji\",\"Segoe UI Emoji\",\"Noto Color Emoji\",sans-serif";
    c.textAlign     = "center";
    c.textBaseline  = "middle";
    c.fillText(TEXT.heroEmoji, W * 0.25, H * 0.47);
  }

  // --- score label ---
  c.fillStyle    = "#ffffff";
  c.font         = "bold 36px 'Fredoka', 'Arial Rounded MT Bold', 'Arial', sans-serif";
  c.textAlign    = "center";
  c.textBaseline = "middle";
  c.fillText("Score: " + postcardScore, W * 0.65, H * 0.38);

  // --- rank (only if available) ---
  if (lastRank !== null) {
    c.fillStyle = "#f5c518";
    c.font      = "bold 28px 'Fredoka', 'Arial Rounded MT Bold', 'Arial', sans-serif";
    c.fillText("Rank #" + lastRank + " on the leaderboard", W * 0.65, H * 0.50);
  }

  // --- greeting (large, festive) ---
  c.fillStyle    = "#c0392b";
  c.font         = "bold 72px 'Mountains of Christmas', 'Georgia', serif";
  c.textAlign    = "center";
  c.textBaseline = "middle";
  // slight shadow for depth
  c.shadowColor  = "rgba(0,0,0,0.5)";
  c.shadowBlur   = 8;
  c.fillText(TEXT.postcardGreeting, W * 0.65, H * 0.63);
  c.shadowBlur   = 0;

  // --- small snowflakes sprinkled on card ---
  c.fillStyle    = "rgba(255,255,255,0.7)";
  c.font         = "18px sans-serif";
  c.textAlign    = "center";
  c.textBaseline = "middle";
  const flakePositions = [
    [0.08, 0.15], [0.15, 0.30], [0.05, 0.50],
    [0.88, 0.12], [0.93, 0.28], [0.82, 0.42],
  ];
  for (const [fx, fy] of flakePositions) {
    c.fillText("❄", fx * W, fy * H);
  }

  // --- trigger download ---
  const link    = document.createElement("a");
  link.download = TEXT.postcardFile;
  link.href     = oc.toDataURL("image/png");
  link.click();
}

postcardBtn.addEventListener("click", drawPostcard);

// ── START SCREEN ──────────────────────────────────────────────────────────────
const startScreen = document.getElementById("start-screen");
const startBtn    = document.getElementById("start-btn");

function startGame() {
  getAudioCtx();  // create/resume AudioContext on user gesture (browser policy)
  running    = true;
  heroX      = cssW / 2;
  targetX    = heroX;
  score      = 0;
  lives      = CONFIG.lives;
  roundTime  = 0;
  invTimer   = 0;
  blinkPhase = 0;
  streak       = 0;
  comboMult    = 1;
  reindeer     = 0;
  dashTimer    = 0;
  dashCooldown = 0;
  dashDir      = 1;
  dashTrail    = [];
  lastMoveDir  = 1;
  items        = [];
  spawnTimer   = spawnEvery();
  _lastDisplayedScore = 0;
  for (const k in effects) delete effects[k];
  comboBanner.classList.remove("combo-anim");
  if (window.gsap) gsap.set(comboBanner, { autoAlpha: 0, scale: 1 });
  powerHud.innerHTML = "";
  updateHUD();
  startScreen.classList.add("hidden");
  // Reset game-over panel position so its next entrance is clean
  if (window.gsap) gsap.set(gameoverScreen, { y: 0, autoAlpha: 0 });
  gameoverScreen.classList.add("hidden");
  document.getElementById("hud").classList.remove("hidden");
  powerHud.classList.remove("hidden");
}

startBtn.addEventListener("click", startGame);

// ── AUDIO ─────────────────────────────────────────────────────────────────────
// One shared AudioContext, created on first Start press (browser autoplay policy).
// All sound functions are no-ops when muted or when AudioContext is unavailable.
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch(e) { audioCtx = null; }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(function(){});
  }
  return audioCtx;
}

// Mute state — persisted in localStorage
let muted = false;
try { muted = localStorage.getItem("game.muted") === "1"; } catch(e) {}

const muteBtn = document.getElementById("mute-btn");
muteBtn.textContent = muted ? "🔇" : "🔊";
muteBtn.addEventListener("click", function() {
  muted = !muted;
  muteBtn.textContent = muted ? "🔇" : "🔊";
  try { localStorage.setItem("game.muted", muted ? "1" : "0"); } catch(e) {}
});

// Happy blip — short sine chirp rising in pitch (good catch)
function playBlip() {
  if (muted) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    const t = ctx.currentTime;
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.linearRampToValueAtTime(880, t + 0.08);
    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    osc.start(t);
    osc.stop(t + 0.18);
  } catch(e) {}
}

// Low thud — detuned triangle burst (bad hit)
function playThud() {
  if (muted) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "triangle";
    const t = ctx.currentTime;
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.15);
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    osc.start(t);
    osc.stop(t + 0.22);
  } catch(e) {}
}

// Three falling notes — played at 0 ms, 220 ms, 440 ms (game over)
function playGameOver() {
  if (muted) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  const notes = [520, 370, 220];
  notes.forEach(function(freq, i) {
    try {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      const t = ctx.currentTime + i * 0.22;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.30, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      osc.start(t);
      osc.stop(t + 0.35);
    } catch(e) {}
  });
}

// ── BOOT ──────────────────────────────────────────────────────────────────────
resize();
generateStars();
requestAnimationFrame(loop);
window.Leaderboard?.init();

// ── GSAP ENTRANCE ANIMATIONS (start screen) ───────────────────────────────────
// Runs once after the page loads. All wrapped in window.gsap guards.
(function initGsapAnimations() {
  if (!window.gsap) return;

  const title   = document.getElementById("game-title");
  const startBt = document.getElementById("start-btn");

  // Title drops in from above with a small elastic bounce
  gsap.fromTo(title,
    { y: -80, autoAlpha: 0 },
    { y: 0,   autoAlpha: 1, duration: 0.9, ease: "elastic.out(1, 0.55)", delay: 0.1 }
  );

  // Start button gently pulses (scale 1 → 1.07 → 1, forever)
  gsap.to(startBt, {
    scale: 1.07, duration: 0.75, ease: "sine.inOut",
    yoyo: true, repeat: -1,
  });
})();
