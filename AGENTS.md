# AGENTS.md: Sip n Vibe game kit

## Who you work with
The human is new to coding. Use plain words. No jargon without a one-line explanation.
Keep replies short: 3 lines on what you did, then "Try this:" with 2 to 4 things to test in the browser.

## Project
A Christmas "catch and dodge" arcade game. A hero moves along the bottom of the screen. Good things fall and give points. Bad things fall and cost a life.
Plain HTML, CSS and JavaScript in the browser, plus one Vercel Function for the online leaderboard.
Vercel serves it from the `main` branch on GitHub.
The human's choices (name, hero, items, style) are in `specs/my-game.md`.

## Hard rules
1. Files: `index.html`, `styles.css`, `game.js`, `README.md`, `specs/my-game.md`, plus `leaderboard.js` (leaderboard screens) and `api/scores.js` (leaderboard server). Do not add other files unless the human asks.
2. No npm packages, no build step, no image files, no audio files. Use only the **approved libraries** below, from the exact URLs given. Sound is the Web Audio API.
3. Load scripts as classic scripts with `defer`, in this order: libraries, then `leaderboard.js`, then `game.js` last. Do not use ES modules in the browser. The game must work when the human double-clicks `index.html` (file://).
4. Put every tunable number in the `CONFIG` object at the top of `game.js`. Put every UI string in the `TEXT` object.
5. Never run a command that does not exit (no web servers, no `vercel dev`, no watch modes). The human tests in the browser.
6. Run `git`, `gh` or `vercel` only when the human asks.
7. Secrets live only in Vercel environment variables. Read them with `process.env` inside `api/` files. Never put a token or a URL with a token in `index.html`, `game.js`, `README.md` or a commit message.
8. No tracking scripts. The only personal data is a nickname that the player types. Show the player that the nickname is public.
9. Make the smallest change that does the job. Do not rewrite or reformat code that the request does not touch. Keep the existing gameplay unless the human asks to change it.
10. **Big files:** `game.js` gets long. Do not read it from top to bottom. Search for the function or name you need (for example `endGame`), then read only that part (150 lines or fewer at a time).

## Approved libraries (optional; add one only when a request needs it)
| Library | Use it for | Tag |
|---|---|---|
| GSAP 3.15 | animating HTML overlays (screens, HUD, buttons) | `<script src="https://cdn.jsdelivr.net/npm/gsap@3.15/dist/gsap.min.js" defer></script>` |
| canvas-confetti 1.9 | confetti bursts | `<script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9/dist/confetti.browser.min.js" defer></script>` |
| Twemoji 17 images | the same emoji art on every device | image base `https://cdn.jsdelivr.net/gh/jdecked/twemoji@17.0.2/assets/72x72/` + codepoint + `.png` |
| Bunny Fonts | festive fonts (an EU-friendly mirror of Google Fonts) | `<link rel="stylesheet" href="https://fonts.bunny.net/css?family=mountains-of-christmas:700|fredoka:400,600&display=swap">` |

Library rules:
- The game must still work if a library does not load. Check `window.gsap` and `window.confetti` before you use them. Always keep a font fallback: `system-ui, sans-serif`.
- GSAP animates HTML elements only. The canvas game loop stays on `requestAnimationFrame`.
- Confetti uses its own default canvas. Call it as `confetti({ ..., disableForReducedMotion: true })`.
- **Twemoji:** codepoint = `[...emoji].map(c => c.codePointAt(0).toString(16)).filter(h => h !== 'fe0f').join('-')`. Load each image with `img.crossOrigin = 'anonymous'` set **before** `img.src`. If an image fails, draw the native emoji instead. Draw the images into the emoji cache (see the engine rules).

## Game engine rules (always apply, even if the prompt or the spec does not say so)
- **Data first:** describe game content as data at the top of `game.js`: `ITEMS` (emoji, kind `good`/`bad`/`power`, points, weight, speed multiplier, movement `straight`/`zigzag`/`fast`/`split`), `HEROES`, `LEVELS`, `MISSIONS`, `TROPHIES` when they exist. To add new content, add rows. Add new code only when a new behaviour needs it.
- **Effects:** timed power-ups live in one `effects` object (name → seconds left). `update(dt)` counts them down. Each effect has one clear place in the code where it acts.
- **Canvas:** one full-viewport `<canvas id="game">` (`100dvh`, with a `100vh` fallback). Size it to its CSS size × `devicePixelRatio` (cap at 2), call `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)`, and do this again on `resize`.
- **Sizes:** `unit = Math.min(cssWidth, cssHeight)`. All sizes use `unit`. All fall speeds use the CSS height.
- **Loop:** one `requestAnimationFrame` loop. `dt = Math.min((now - last) / 1000, CONFIG.maxDt)`. No `setInterval` or `setTimeout` for gameplay. Spawning and timers use `dt`.
- **Draw order:** sky → far background → near background → items → hero → effects/particles → screen-shake offset. Wrap the shake in `ctx.save()`/`ctx.restore()`.
- **Screens:** the start screen, the HUD, the game-over screen and the panels are HTML overlays above the canvas, not canvas text. Buttons are at least 48 px high. Space and Enter press the visible main button. The HUD stays inside `env(safe-area-inset-*)`.
- **Emoji cache:** font `"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`, with `textAlign = 'center'` and `textBaseline = 'middle'`. After each resize, draw each sprite once to an offscreen canvas and reuse it.
- **Controls:** ArrowLeft/ArrowRight and A/D move the hero while held. On `pointerdown`/`pointermove` over the canvas, set `targetX`; each frame, `x += (targetX - x) * Math.min(1, dt * CONFIG.followEase)`. Clamp the hero inside the edges.
- **No scroll:** the canvas has `touch-action: none`. The body has `overscroll-behavior: none` and `user-select: none`.
- **Collision:** circle vs circle, radius `0.45 × size`. Items that pass the bottom disappear with no penalty.
- **Hit:** a bad item costs 1 life (unless a shield blocks it) and gives `CONFIG.invulnerableTime` seconds of invulnerability. During that time the hero blinks.
- **Speed-up:** `level = Math.floor(score / 10)`, unless the game has `LEVELS`. Raise the fall speed and the spawn rate up to the caps.
- **Storage:** wrap `localStorage` in try/catch. Keys start with `game.`.
- **Sound:** one shared `AudioContext`, created or resumed on the first Start press. Respect mute.
- **Phone extras:** call `navigator.vibrate?.(…)` only, never without the `?.`.
- **Text from players:** show names with `textContent`, never `innerHTML`.
- **Performance:** at most 40 falling items and 200 particles at the same time. Remove anything off-screen.

Default CONFIG (use these values unless the spec or the human says otherwise):
```js
const CONFIG = {
  lives: 3, heroSize: 0.14, itemSize: 0.09,
  heroKeySpeed: 1.2, followEase: 15,
  startFallSpeed: 0.30, fallSpeedStep: 0.03, maxFallSpeed: 0.90,
  startSpawnEvery: 0.90, spawnStep: 0.05, minSpawnEvery: 0.35,
  badWeight: 0.25, badStep: 0.02, maxBad: 0.40,
  invulnerableTime: 1.0, maxDt: 0.05,
};
```

## Online leaderboard rules
- **Storage:** Upstash Redis, connected through the Vercel Marketplace. Read `process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL` and `process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN`.
- **No SDK:** call the Upstash REST API with `fetch`. Send `POST <url>/pipeline` with header `Authorization: Bearer <token>` and a JSON body that is an array of commands, for example `[["ZADD","leaderboard","GT",120,"Eman"]]`. Each result is `{ result }` or `{ error }`.
- **Function:** `api/scores.js` uses the Web standard export: `export default { async fetch(request) { … } }`. Return JSON with `Cache-Control: no-store`.
  - `GET /api/scores` → `{ ok: true, top: [{ name, score }] }`, the top 10 (`ZRANGE leaderboard 0 9 REV WITHSCORES`).
  - `POST /api/scores` with `{ name, score, seconds }` → `{ ok: true, rank, top }`.
  - Missing env variables → status 503 `{ ok: false, error: "not configured" }`.
- **Checks on the server:**
  - Trim the name and collapse spaces. Allow 1 to 12 characters matching `/^[\p{L}\p{N} ._-]+$/u`. Reject names that contain a word from a `BLOCKED_WORDS` array at the top of the file (start it empty).
  - The score is an integer from 1 to 1,000,000. The seconds are a number from 3 to 3600.
  - Reject the score if it is more than `seconds × 60 + 50`.
  - Rate limit: `SET rl:<ip> 1 NX EX 10` (IP from `x-forwarded-for`). If it returns null, send status 429.
  - Keep each name's best score only: `ZADD leaderboard GT score name`. Rank = `ZREVRANK` + 1.
- **In the browser:** all leaderboard code lives in `leaderboard.js` as `window.Leaderboard` with `init()` and `submit(score, seconds)`. `game.js` only calls `window.Leaderboard?.init()` and `window.Leaderboard?.submit(...)`.
  - Ask for a nickname once. Store it as `game.name` and let the player change it. Show "Your nickname is public. Do not use your full name."
  - At game over, POST the score (only if > 0). Show the rank and the top 10 on the game-over screen. Show the top 10 on the start screen.
  - Use a 5-second timeout (`AbortController`). If the fetch fails or the page runs from file://, show "The online leaderboard works on your live site", keep the local best score, and never block play.

## When the human asks for a spec (Plan mode)
Write `specs/my-game.md` with these sections:
- **Goal:** 2 to 3 sentences.
- **My choices:** name, hero emoji, good items (emoji and points each), bad item, lives, style (colours as hex codes).
- **Tasks:** exactly these 5. Each has a checkbox and a "Done when" list of 3 to 5 checks that a non-coder can do in the browser.
  1. World: the files, the sky, the start screen, the hero at the bottom.
  2. Movement: keys, mouse, and finger.
  3. Falling things: spawning, catching, score, lives, HUD, speed-up.
  4. Game over: the overlay, the best score, play again.
  5. Christmas magic: empty for now.
- **Extras:** empty. You add one line per extra the human builds later.
- **Decisions:** empty. You add choices here when something is unclear.
Do not write code in Plan mode. Do not repeat the engine rules in the spec.

## After each build request (Agent mode)
1. Find the matching task in `specs/my-game.md`. If there is none, add a line under "Extras".
2. Make the change.
3. Run `node --check` on every `.js` file you changed. Fix every error.
4. Read your diff once against the "Done when" list in the request.
5. Tick the box: `- [x]`.
6. Reply: what you built (up to 3 lines), then "Try this:" with 2 to 4 checks.
