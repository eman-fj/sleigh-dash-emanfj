# Sleigh Catch — Game Spec

## Goal
Steer a sleigh along the bottom of the screen and catch falling gifts and cookies while dodging lumps of coal. Collect as many points as you can before you lose all three lives.

## My choices
- **Name:** Sleigh Catch
- **Hero:** 🛷 (sleigh)
- **Good items:**
  - 🎁 Gift — 1 point
  - 🍪 Cookie — 3 points
- **Bad item:** 🪨 Lump of Coal
- **Lives:** 3
- **Style:** Cosy night sky — dark blue background (`#0d1b4b`), gold accents (`#f5c518`), red highlights (`#c0392b`)

## Tasks

- [x] **Task 1 — World:** Set up the files, the night-sky canvas, the start screen, and the sleigh at the bottom.
  - Done when:
    - [x] Opening `index.html` in a browser shows a dark-blue sky canvas that fills the whole screen.
    - [x] A start screen overlay appears with the game name and a Start button.
    - [x] The 🛷 sleigh sits along the bottom of the canvas.
    - [x] No errors appear in the browser console.

- [x] **Task 2 — Movement:** Make the sleigh move left and right.
  - Done when:
    - [x] Pressing **←** / **→** (or **A** / **D**) slides the sleigh smoothly.
    - [x] Clicking or tapping anywhere on the canvas steers the sleigh toward that spot.
    - [x] The sleigh cannot move off the left or right edge.
    - [x] Movement feels smooth on both desktop and phone.

- [x] **Task 3 — Falling things:** Spawn gifts, cookies, and coal; handle catching, score, lives, HUD, and speed-up.
  - Done when:
    - [x] 🎁 gifts and 🍪 cookies fall from random positions; catching one adds the right points.
    - [x] 🪨 coal falls too; hitting it costs 1 life and the sleigh blinks briefly.
    - [x] The HUD shows the current score and remaining ❤️ lives at the top of the screen.
    - [x] Every 10 points the items fall a little faster and spawn more often.
    - [x] Items that reach the bottom without being caught disappear with no penalty.

- [x] **Task 4 — Game over:** Show the game-over screen, save the best score, and allow replay.
  - Done when:
    - [x] Losing all 3 lives stops the game and shows a game-over overlay.
    - [x] The overlay displays the final score and the all-time best score.
    - [x] The best score is still there after refreshing the page.
    - [x] A **Play Again** button (or pressing Space / Enter) restarts immediately.

- [-] **Task 5 — Christmas magic:** *(in progress)*

## Extras
- Postcard: "Make a postcard" button on game-over screen downloads a 900×630 PNG with the game name, hero 🛷 (or face photo), score, rank (if available), and "God jul!".
- Face hero: "📸 Use my face" on start screen — picks a photo, circle-crops it to 128 px, adds a 🎅 hat, stores it in localStorage. "❌ Remove my face" restores the sleigh. Photo never leaves the device.
- Combo streak: x2 at 5 catches, x3 at 10, x5 at 20. Points multiplied. Banner + HUD badge. Resets on hit or miss.
- Power-ups (kind "power", ~1-in-25): 🧲 Magnet (5 s drift), 🛡️ Shield (1 hit), ☕ Hot Cocoa (5 s half-speed). HUD timer bars at bottom.
- Dash: Space key or double-tap → quarter-screen dash, 0.15 s, fading trail, 2 s cooldown ring under hero.
- New dangers (score-gated): 🧊 Icicle (1.8× speed, straight, unlocks at 20), ❄️ Snowball (zigzag, unlocks at 40), 💣 Christmas Cracker (splits into 3 💥 fragments at half-screen, unlocks at 60).
- Northern lights: 3 wavy green/purple/teal bands drawn with additive blending, fade in from score 50 over the next 30 points, always animating behind the sky.
- Background snow: 60 flakes on desktop (≥600 px wide), 30 on phone, gentle sideways drift, visible on all screens including start and game-over.
- GSAP 3.15 animations: title elastic drop-in, start button infinite pulse, score pop on change, game-over panel slides up, combo/reindeer banners scale-in and fade-out. Full CSS fallback when GSAP does not load.
- Web Audio API sounds: 🔊 blip on catch, low thud on bad hit, 3 falling notes at game over. 🔊/🔇 mute button (top-right, persisted in localStorage). AudioContext created on first Start press for browser/phone compatibility.
- Reindeer (fully implemented): +1 🦌 every 25 pts (max 4), shown as 🦌×N in HUD. Each reindeer widens good-item catch radius by 8%; bad items always use base hero radius only. Lose 1 reindeer on each bad hit. Banner: "🦌 +1 reindeer: wider gift catch!".

## Decisions
*(nothing to decide yet)*
