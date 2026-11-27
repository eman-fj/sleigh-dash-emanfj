# Spec: Sleigh Dash

## Goal
A one-screen arcade game. The player steers a sleigh along the bottom of the screen.
Gifts and gingerbread fall from the sky. The player catches them for points.
Coal also falls. Coal costs one life. The player has 3 lives. The game gets faster as the score goes up.

## Players and devices
- Party guests, with or without gaming experience.
- Phones in portrait (iOS Safari 16+, Chrome on Android) and laptops (Chrome, Safari, Firefox, Edge).
- One round lasts 1 to 3 minutes.

## Files
`index.html`, `styles.css`, `game.js`, `README.md`.

## Design

### Layout
- A full-viewport `<canvas id="game">`. Height: `100dvh`, with a `100vh` fallback.
- HTML overlays above the canvas (not drawn on the canvas):
  - `#hud`: score, lives as hearts, best score. Top of the screen, inside `env(safe-area-inset-*)`.
  - `#start`: title "Sleigh Dash 🛷", a one-line "how to play" text, a large **Start** button.
  - `#gameover`: "Game over", the score, the best score, "New best!" when it is a record, a large **Play again** button.
  - `#mute`: a 🔊/🔇 button in the top-right corner (task 4).
- Buttons are at least 48 px high.

### States
`start` → `playing` → `gameover` → `playing`.
Space or Enter does the same as the visible button.

### Canvas and loop
- Size the canvas to its CSS size × `devicePixelRatio` (cap DPR at 2). Call `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)`. Do this again on `resize`.
- `unit = Math.min(cssWidth, cssHeight)`. All sizes use `unit`. All fall speeds use the CSS height.
- Use one `requestAnimationFrame` loop with delta time in seconds: `dt = Math.min((now - last) / 1000, CONFIG.maxDt)`.
- No `setInterval` and no `setTimeout` for gameplay. Spawning uses a time accumulator.

### Sprites
- Sleigh: 🛷. Gift: 🎁. Gingerbread: 🍪. Coal: a canvas circle, fill `#222`, with a small grey highlight.
- Emoji font: `"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`. Use `textAlign = 'center'` and `textBaseline = 'middle'`.
- After each resize, draw each emoji once to an offscreen canvas and reuse it, so that low-end phones stay fast.

### Controls
- Keyboard: ArrowLeft/ArrowRight and A/D move the sleigh while held. Speed: `CONFIG.sleighKeySpeed` × canvas width per second.
- Pointer: on `pointermove` and `pointerdown` over the canvas, set `targetX` to the pointer x. Each frame, ease the sleigh toward it: `x += (targetX - x) * Math.min(1, dt * CONFIG.followEase)`.
- Clamp the sleigh inside the screen edges.
- The canvas has `touch-action: none`. The body has `overscroll-behavior: none` and `user-select: none`. The page must never scroll or zoom during play.

### Rules
- Sleigh centre y = canvas height − `1.0 × sleighSize px`.
- Spawn at a random x (keep the item fully on screen) just above the top edge.
- Item types are picked by weight: gift, gingerbread, coal (see CONFIG).
- Collision is circle vs circle. Radius = `0.45 × size` for the sleigh and for the items.
- Catch a gift: +1. Catch gingerbread: +3. The item disappears.
- Touch coal: −1 life. The item disappears. The sleigh is invulnerable for `CONFIG.invulnerableTime` and blinks (draw it every other 0.1 s).
- An item that passes the bottom edge disappears. There is no penalty.
- `level = Math.floor(score / 10)`. Every level makes items faster, spawns more often, and adds more coal, up to the caps in CONFIG.
- 0 lives → state `gameover`.
- Best score is stored in `localStorage` key `sleighDash.best`, inside try/catch.

### CONFIG (start values)
```js
const CONFIG = {
  lives: 3,
  sleighSize: 0.14,        // × unit, emoji font size in px
  itemSize: 0.09,          // × unit
  sleighKeySpeed: 1.2,     // × canvas width per second
  followEase: 15,
  startFallSpeed: 0.30,    // × canvas height per second
  fallSpeedStep: 0.03,     // added per level
  maxFallSpeed: 0.90,
  startSpawnEvery: 0.90,   // seconds
  spawnStep: 0.05,         // removed per level
  minSpawnEvery: 0.35,
  weights: { gift: 0.60, cookie: 0.15, coal: 0.25 },
  coalStep: 0.02,          // added to coal weight per level
  maxCoal: 0.40,
  points: { gift: 1, cookie: 3 },
  invulnerableTime: 1.0,
  maxDt: 0.05,
};
```

### Look
- Night sky: vertical gradient `#0b1d3a` → `#1e3a5f`.
- Accent red `#c8102e`, gold `#f4c542`, text `#fffaf0`. Font: `system-ui, sans-serif`.

### TEXT (English for now; a language switch comes later)
```js
const TEXT = {
  title: 'Sleigh Dash 🛷',
  howTo: 'Catch 🎁 and 🍪. Dodge the coal. Drag or use ← →.',
  start: 'Start',
  gameOver: 'Game over',
  score: 'Score',
  best: 'Best',
  newBest: 'New best!',
  playAgain: 'Play again',
};
```

## Tasks

- [ ] **Task 1: Skeleton and loop**
  Create the files, the canvas sizing, the loop, the states, the overlays (`#start`, `#hud`, `#gameover`), and draw the sleigh at the bottom centre.
  Done when:
  - Opening `index.html` by double-click shows the night sky and the start overlay.
  - Start hides the overlay and shows the sleigh at the bottom centre.
  - After a window resize, the sleigh stays at the bottom and is sharp, not blurry.
  - `node --check game.js` passes. There are no console errors.

- [ ] **Task 2: Gameplay**
  Controls, spawning, falling, collisions, score, lives, invulnerability blink, level ramp.
  Done when:
  - The arrow keys, A/D, the mouse and a finger all move the sleigh. It stops at the edges.
  - A gift gives +1 and gingerbread gives +3. The HUD updates.
  - Coal removes one heart and the sleigh blinks for 1 s.
  - After 30 points, items are clearly faster and more frequent.
  - On a phone, dragging does not scroll or zoom the page.

- [ ] **Task 3: Game over and best score**
  Done when:
  - After the third coal hit, `#gameover` shows the score and the best score.
  - "New best!" shows only on a new record.
  - Play again (button, Space or Enter) starts a fresh round with 3 lives and score 0.
  - The best score survives a page reload.

- [ ] **Task 4: Christmas polish**
  - Snow: 60 flakes (30 if the CSS width is under 500 px). White, radius 1–3 px, slow fall with a little sideways drift, wrapping around. It shows in all states.
  - Floating text: "+1" or "+3" in gold rises 40 px and fades over 0.6 s at the catch point.
  - Coal hit: screen shake for 0.25 s (amplitude 0.02 × unit) and `navigator.vibrate?.(100)`.
  - Sound (Web Audio, no files): catch = short triangle blip 880→1320 Hz, 0.08 s. Coal = square thud at 120 Hz, 0.2 s. Game over = three falling notes. Create or resume the `AudioContext` on the first Start press.
  - `#mute` button toggles sound. Store it in `localStorage` key `sleighDash.muted`.
  Done when: all of the above work, sound plays on an iPhone after Start, and mute is remembered after a reload.

- [ ] **Task 5: Ready to share**
  - `<head>`: charset; viewport `width=device-width, initial-scale=1, viewport-fit=cover`; title "Sleigh Dash 🛷"; meta description; `theme-color` `#0b1d3a`; `apple-mobile-web-app-capable`; `og:title` and `og:description`; an emoji favicon as an SVG data URI.
  - `README.md`: what the game is, how to play, how to run it locally (double-click `index.html`), and a line `Live: <add Vercel URL>`.
  Done when: the page opens with no console errors, the tab shows the favicon, and the README is complete.

## Decisions
(The agent adds choices here when the spec is unclear.)
