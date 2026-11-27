# 🎄 Sip n Vibe: your prompt cards

**How to use a card**
1. Copy the prompt.
2. Change the parts in **[brackets]** to your own choices.
3. Paste it into Bob and press Enter.
4. Read what Bob wants to change, then approve.
5. Test it: double-click `index.html`, or press F5 to reload it.

Every prompt has 4 parts: **What** you want · **How** it should work · **Context** (the files Bob reads) · **Done when** (how you check it).

**Helper commands:**
- `/save` saves a checkpoint.
- `/stuck` makes Bob ask you questions, then fix the problem.
- `/ship` puts your latest version online.
- `/clear` starts fresh. Use it between cards.

**Difficulty:** 🟢 easy, one prompt · 🟡 medium, may need one fix · 🔴 hard, plan for 2 to 3 prompts

---

## Lab 1 · Say hello to Bob (Ask mode)
Type `/mode` and choose **Ask**. Ask mode only reads. It changes nothing.

**1.1 Meet Bob**
```
Hi Bob! I am new to coding. Read @AGENTS.md and tell me in 5 short bullet points what kind of game I will build tonight and which rules you will follow.
```

**1.2 Know your modes**
```
What is the difference between Ask, Plan and Agent mode? Answer in 3 short lines with one example each.
```

---

## Lab 2 · Design your game (Plan mode)
Type `/mode` and choose **Plan**. Plan mode writes plans. It does not touch code.

**2.1 Your game card**: fill in every [bracket]
```
Help me design my Christmas game.
Name: [Sleigh Dash]
Hero at the bottom of the screen: [🛷]          ideas: 🦌 🎅 ⛄ 🐧 🧝
Good things that fall: [🎁 = 1 point, 🍪 = 3 points]   ideas: 🍬 🧦 🍊 🔔
Bad thing that falls: [a lump of coal]         ideas: 💣 🥦 👹 🧊
Lives: [3]
Style: [cosy night sky, dark blue with gold and red]   ideas: candy cane, Northern lights, gingerbread brown
Write the spec in specs/my-game.md. Follow the spec rules in @AGENTS.md. Do not write code.
Done when: I can open specs/my-game.md and see my choices and 5 tasks.
```

Open `specs/my-game.md` and read it. **This is your plan.** Edit it yourself, or ask Bob:

**2.2 Change your plan** (optional)
```
Change my spec: [make it easier for kids / start with 5 lives / use pink and white colours]. Only edit specs/my-game.md.
```

---

## Lab 3 · Build it, piece by piece (Agent mode)
Type `/clear`, then `/mode` and choose **Agent**. Now Bob can create files. You approve each change.
After each card: **test it, then type `/save`.**

**3.1 Build the world**
```
Let's build the world for my game (task 1 in @specs/my-game.md).
Show a full-screen sky in my style and a start screen with my game name, one line on how to play, and a big Start button.
When I press Start, the start screen hides and my hero stands at the bottom centre.
Done when: I double-click index.html, press Start, and see my hero, sharp and not blurry.
```

**3.2 Make it move**
```
Make my hero move (task 2).
On a laptop: arrow keys and A/D. On a phone: drag with a finger. With a mouse: the hero follows the pointer.
The hero moves smoothly and stops at the edges. The page must not scroll or zoom when I drag.
Done when: I can move my hero to both edges with the keys and with the mouse.
```

**3.3 Let it rain presents**
```
Make things fall from the sky (task 3).
My good things give their points and disappear when I catch them. My bad thing costs one life and makes my hero blink for 1 second.
Show my score and my lives as ❤️ at the top. Every 10 points the game gets a bit faster.
Done when: I can catch things, see my score go up, and lose a heart when I hit the bad thing.
```

**3.4 Game over**
```
Add the end of the game (task 4).
When I have no lives left, show "Game over", my score, my best score, "New best!" if it is a record, and a big Play again button. Space or Enter also plays again.
Remember my best score after I reload the page.
Done when: I lose all my lives, see my score, play again, and my best score is still there after a reload.
```

🎉 **You have a real game now.** Type `/save`.

**3.5 Peek under the hood** (optional, Ask mode)
```
Explain in 3 short sentences how my game knows that I caught something. Name the function in game.js that does it.
```

---

## Lab 4 · Put it online (Agent mode)
Ask a host to help you once with `gh auth login` and `vercel login` in a second window.
Pick a project name: lowercase, no spaces, unique. For example `sleigh-dash-eman`.

**4.1 Ship it**
```
Put my game online. Use the project name [sleigh-dash-yourname].
1. If this folder is not a git repo, run git init -b main. Then add all files and commit with a short message.
2. Create a public GitHub repo with that name using gh repo create, and push.
3. Deploy to Vercel: vercel link --yes --project [same name], then vercel --prod --yes, then vercel git connect --yes.
4. In README.md, write what my game is, how to play, and the live URL. Commit and push again.
Stop and tell me if any command asks me to log in or asks a question.
Done when: you show me the live URL and I can open it on my phone.
```

📱 Open the URL on your phone. From now on: **change → test → `/ship`**, and your phone gets the new version about a minute later.

---

## Lab 5 · Online leaderboard 🏆 (Agent mode)
Players type a nickname. No sign-up. Everyone who plays your live game shares one leaderboard.

**5.1 Connect a database** (in the browser, about 3 min, no prompt)
1. Open [vercel.com](https://vercel.com) → your project → the **Storage** tab.
2. Choose **Upstash for Redis** (from the Marketplace) → the **free** plan → **Create**.
3. **Connect** it to your project for all environments.
4. Vercel adds the keys for you, as environment variables. You never copy them into your code.

Build the leaderboard in 3 small steps. Type `/clear` before each one.

**5.2a Leaderboard server** 🟢
```
Leaderboard step 1 of 3: the server.
Create api/scores.js. Follow the "Online leaderboard rules" in @AGENTS.md exactly.
Do not read or change game.js, index.html or styles.css.
Done when: node --check api/scores.js passes, and the file has GET (the top 10) and POST (save a score with all the checks).
```

**5.2b Leaderboard screens** 🟡
```
Leaderboard step 2 of 3: the screens.
Create leaderboard.js. Follow the "Online leaderboard rules" in @AGENTS.md. It defines window.Leaderboard with:
- init(): adds a nickname field and a "🏆 Hall of fame" top 10 to the start screen. Under the field: "Your nickname is public. Do not use your full name."
- submit(score, seconds): sends my score, then shows my rank and the top 10 on the game-over screen, with my own row highlighted.
- If the leaderboard cannot load, show a friendly message. Never block the game.
Read index.html to find the start screen and the game-over screen. Add the styles to styles.css. Load leaderboard.js just before game.js.
Do not read or change game.js.
Done when: node --check leaderboard.js passes, and when I double-click index.html I see the nickname field and a friendly Hall of fame message.
```

**5.2c Connect it to the game** 🟢
```
Leaderboard step 3 of 3: connect it to the game.
In game.js, search for the start-up code and for endGame. Do not read the whole file.
1. Call window.Leaderboard?.init() once at start-up.
2. In endGame, call window.Leaderboard?.submit(score, seconds). seconds = how long the round lasted. If game.js does not track this yet, add one variable for it.
Done when: node --check game.js passes, and the game still starts, plays and ends as before when I double-click index.html.
```

**5.3 Test it live**
Type `/ship`, wait 1 minute, then open your live URL. Play one round on your laptop and one on your phone with different nicknames. Both must show in the Hall of fame.
Not working? Type `/stuck` and say "the online leaderboard". Then check the table in step 7 of the runbook.

---

## Lab 6 · Level up the gameplay (optional, pick any)

| Card | What it adds | | Needs first |
|---|---|---|---|
| 6.0 | Get ready (tidy the code) | 🟢 | **all of Lab 6** |
| 6.1 | Combo streak | 🟢 | — |
| 6.2 | Power-ups: magnet, shield, cocoa | 🟡 | — |
| 6.3 | More power-ups: star power, extra life | 🟢 | 6.2 |
| 6.4 | New dangers: icicles, snowballs, crackers | 🟡 | — |
| 6.5 | Dash move | 🟢 | — |
| 6.6 | Growing sleigh | 🟢 | — |
| 6.7 | Oslo levels | 🟡 | — |
| 6.8 | Missions and badges | 🟢 | — |
| 6.9 | Snowstorm | 🟡 | — |
| 6.10 | Boss: Trollkongen | 🔴 | 6.7 recommended |
| 6.11 | Chimney delivery | 🔴 | — |
| 6.12 | Choose your hero | 🟡 | — |
| 6.13 | Your face as the hero | 🟡 | — |
| 6.14 | Music that speeds up | 🟡 | 8.2 recommended |
| 6.15 | Northern lights | 🟢 | — |
| 6.16 | Trophy shelf | 🟢 | — |

Use one card at a time: `/clear` → card → test → `/save` (or `/ship` if your game is online).

**6.0 Get ready to level up** 🟢 *(do this once, before any other Lab 6 card)*
```
Prepare my game for new features. Follow the "Data first" and "Effects" rules in @AGENTS.md.
Move my items into an ITEMS table, add an empty effects object that update(dt) counts down, and keep all numbers in CONFIG.
Do not change how the game looks or plays.
Done when: the game plays exactly as before, and game.js has an ITEMS table at the top.
```

### Gameplay

**6.1 Combo streak** 🟢
```
Add a combo streak. Each good item I catch in a row raises the multiplier: x2 at 5 catches, x3 at 10, x5 at 20. Points are multiplied.
Show "COMBO x3!" big in the middle of the screen for a moment when the multiplier goes up, and show the current multiplier in the HUD.
The streak resets when I hit a bad thing or when a good thing falls past me.
Done when: catching 5 in a row shows COMBO x2 and doubles my points, and missing one resets it.
```

**6.2 Power-ups** 🟡
```
Add 3 rare power-ups that fall like items (kind "power" in ITEMS, about 1 in 25 items):
🧲 Magnet: good items within half the screen width drift towards me for 5 seconds.
🛡️ Shield: a glowing ring around my hero blocks the next bad hit (lasts until it is used).
☕ Hot cocoa: everything falls at half speed for 5 seconds.
Show active power-ups as small icons with a shrinking timer bar in the HUD.
Done when: each power-up works, shows in the HUD, and ends on time.
```

**6.3 More power-ups** 🟢 *(needs 6.2)*
```
Add 2 more power-ups to my ITEMS table:
🌟 Star power: double points for 5 seconds, and my hero sparkles.
❤️ Extra life: +1 life, max 5. It appears only when I have fewer than 3 lives.
Done when: star power doubles my points for 5 seconds, and the heart gives a life back.
```

**6.4 New dangers** 🟡
```
Add 3 new bad things, each with its own movement, to my ITEMS table:
🧊 Icicle: falls 1.8 times faster, in a straight line.
❄️ Snowball: zigzags left and right as it falls.
💣 Christmas cracker: halfway down the screen it splits into 3 small pieces that fall at angles.
They start to appear after 20 points, one new type every 20 points.
Done when: I see each new danger after the right score, and each moves in its own way.
```

**6.5 Dash move** 🟢
```
Add a dash: double-tap the screen, or press Space during play, to dash quickly in the direction I am moving (or towards the finger).
The dash covers about a quarter of the screen width in 0.15 seconds, leaves a short trail, and has a 2-second cooldown shown as a small ring under my hero.
Done when: I can dash both ways, see the trail, and cannot dash again until the ring is full.
```

**6.6 Growing sleigh** 🟢
```
Every 25 points, one more 🦌 joins in front of my hero, up to 4. Each one makes the catch area 8% wider.
Show "🦌 +1 reindeer!" when one joins. When I lose a life, I lose one reindeer.
Done when: at 25 and 50 points I see new reindeer, and catching gets a bit easier.
```

### The journey

**6.7 Oslo levels** 🟡
```
Add 5 levels in a LEVELS table. A new level starts every 30 points:
1 Grünerløkka (warm city lights), 2 Akerselva (river blue), 3 Holmenkollen (snowy hill), 4 Svalbard (icy white and blue), 5 Nordpolen (deep purple and gold).
Each level has its own sky colours and a simple silhouette drawn at the bottom of the sky, plus a big banner "Level 2: Akerselva" for 2 seconds when it starts.
Each level is a bit faster than the one before. Show the level name in the HUD.
Done when: I reach level 2 at 30 points, the sky and silhouette change, and the banner shows.
```

**6.8 Missions and badges** 🟢
```
Add 3 small missions per round, picked at random from a MISSIONS table, for example "Catch 5 🍪", "No bad hits for 30 seconds", "Reach [combo x3 / level 2]".
Show them in a small panel on the start screen and as ticks in the HUD during play. Each finished mission gives +25 points and a badge with a short pop animation.
Done when: I see 3 missions, finishing one gives a badge and +25 points.
```

**6.9 Snowstorm** 🟡
```
Add a snowstorm event that starts at random after 40 points, at most once a minute.
For 10 seconds the screen goes dark with heavy blowing snow, and only a soft light circle around my hero shows the falling items, like Rudolph's red nose.
Show "❄️ SNOWSTORM!" when it starts.
Done when: a snowstorm starts after 40 points, I can still play inside the light circle, and it ends after 10 seconds.
```

**6.10 Boss: Trollkongen** 🔴
```
Add a boss fight. At [the start of level 5 / 150 points], Trollkongen 👹 appears at the top of the screen with a health bar.
He moves left and right and throws coal in 3 patterns: a straight line, a fan of 5, and fast single shots aimed at me. Normal items stop falling during the fight.
Every 3 seconds a 🎁 falls near me. Each gift I catch hits the troll (the health bar goes down by 10%).
Win: +500 points, a big "Du slo Trollkongen!" banner, and normal play goes on. Lose all lives: normal game over.
Done when: the boss appears, uses all 3 patterns, loses health when I catch gifts, and the win banner shows.
```

**6.11 Chimney delivery** 🔴
```
Change how gifts work: when I catch a 🎁, it goes into my sack (max 5, shown in the HUD).
Rooftops with chimneys slide slowly across the bottom of the sky. When I press the down arrow, or a big 🎁 Drop button in the bottom-right corner on a phone, I drop a gift straight down from my hero.
A gift that lands in a chimney gives 5 points and a puff of smoke. A gift that misses is lost.
Other good items still give points directly.
Done when: I can collect gifts, drop them with the key and the button, score 5 points in a chimney, and see the sack count change.
```

### Heroes

**6.12 Choose your hero** 🟡
```
Add a hero choice on the start screen with 4 cards in a HEROES table:
🦌 Reindeer: moves 30% faster.
⛄ Snowman: 30% wider catch area, 20% slower.
🐧 Penguin: slides (keeps moving a little after I stop).
🎅 Nissen: starts with 1 extra life.
Show each hero's strength on its card, highlight my choice, and remember it.
Done when: each hero plays differently, and my choice is still selected after a reload.
```

**6.13 Your face as the hero** 🟡
```
Add "Use my face" on the start screen. I pick a photo from my device, it is cropped to a circle, shrunk to 128 px, and drawn as my hero with a Christmas hat 🎅 on top.
Store the small photo in localStorage so that it stays after a reload. Add a "Remove my face" button. The photo never leaves my device.
Done when: my photo shows as the hero with a hat, stays after a reload, and the remove button brings the normal hero back.
```

### Atmosphere

**6.14 Music that speeds up** 🟡 *(works best after 8.2)*
```
Add background music made with the Web Audio API: a simple, cheerful Christmas loop (bells and a soft bass). Use a melody you make up, not a known song.
The tempo goes up a little with each level or every 10 points. It uses the same mute button as the other sounds and starts only after I press Start.
Done when: music plays after Start, gets faster as I score, and the mute button stops it.
```

**6.15 Northern lights** 🟢
```
After 50 points, slowly fade in northern lights in the sky: 3 soft, wavy green and purple bands that move gently behind everything.
Done when: at 50 points the northern lights appear behind the game and move smoothly, without slowing it down.
```

**6.16 Trophy shelf** 🟢
```
Add a TROPHIES table with 8 trophies, saved on this device. For example: "First 100 points", "Combo king (x5)", "Survived a snowstorm", "Beat Trollkongen", "Caught 50 cookies in total". Only include trophies for features my game has.
When I win one, show a toast "🏆 Trophy: Combo king!" for 2 seconds. Add a "Trophies" button on the start screen that shows all of them, with locked ones greyed out.
Done when: I win a trophy, see the toast, and it shows as unlocked after a reload.
```

---

## Lab 7 · Make it beautiful (optional, uses libraries)
These cards use the approved libraries in `AGENTS.md`. The game still works if a library does not load.

**7.1 Festive fonts** 🟢
```
Use the approved Bunny Fonts link from @AGENTS.md: "Mountains of Christmas" for the game title and big banners, "Fredoka" for everything else. Keep system-ui as a fallback.
Done when: the title looks festive, the other text is easy to read, and the game works offline with the fallback font.
```

**7.2 Same emoji on every device** 🟡
```
Draw all my emoji sprites with Twemoji images, using the approved base URL and the Twemoji rules in @AGENTS.md (crossOrigin anonymous, fall back to the native emoji if an image fails).
Done when: my hero and items look the same on Windows, Mac and my phone, and the game still works if I block the images.
```

**7.3 Smooth screen animations** 🟢
```
Add GSAP from @AGENTS.md. Animate my HTML screens:
The title drops in with a small bounce, the Start button gently pulses, the score pops a little when it changes, the game-over panel slides up, and banners scale in and fade out.
Check that gsap exists before using it.
Done when: the screens animate smoothly, and the game works the same if GSAP does not load.
```

**7.4 Confetti moments** 🟢
```
Add canvas-confetti from @AGENTS.md. Fire confetti in red, gold and green when I get a new best score, a new level, a combo of x5 or more, or a top-10 rank on the leaderboard. Use disableForReducedMotion.
Done when: a new best score fires confetti, and the game works the same if the library does not load.
```

**7.5 Oslo skyline in layers** 🟡
```
Draw a layered background with no library: far away, the silhouette of hills and the Holmenkollen ski jump; closer, an Oslo-style skyline with lit windows that twinkle now and then; in front, snowy rooftops.
Each layer drifts slowly sideways at a different speed (parallax). Use my style colours.
Done when: I see 3 layers moving at different speeds behind the game, and it stays smooth on my phone.
```

**7.6 Glow and trails** 🟢
```
Make it shine: a soft glow around my hero and around good items (canvas shadowBlur), a short fading trail behind my hero when it moves fast, and a burst of 8 tiny sparkles when I catch something.
Keep it light: max 200 particles.
Done when: catching shows sparkles, my hero glows and leaves a trail, and the game stays smooth on my phone.
```

---

## Lab 8 · Christmas extras (optional, pick any)

**8.1 Let it snow** 🟢
```
Add gentle falling snow in the background: 60 flakes on a laptop, 30 on a phone, with a little sideways drift. Keep the gameplay the same.
Done when: I see snow on the start screen, during play and at game over.
```

**8.2 Jingle sounds** 🟢
```
Add sound with the Web Audio API, no sound files: a happy blip when I catch something, a low thud when I hit a bad thing, and three falling notes at game over. Add a 🔊/🔇 button in the top-right corner that remembers my choice. Keep the gameplay the same.
Done when: I hear the sounds after I press Start (also on my phone), and mute still works after a reload.
```

**8.3 Juice it up** 🟢
```
When I catch something, show "+points" in gold that floats up and fades out. When I hit a bad thing, shake the screen a little and vibrate the phone. Keep the gameplay the same.
Done when: catching shows floating points and a hit shakes the screen.
```

**8.4 Christmas postcard** 🟡
```
On the game over screen, add a "Make a postcard" button. It draws a Christmas card with my game name, my hero, my score, my leaderboard rank if I have one, and "God jul!", and downloads it as a PNG. Keep the gameplay the same.
Done when: I press the button, a postcard image downloads, and it opens without errors.
```

**8.5 Challenge a friend** 🟢
```
On the start screen and the game over screen, add a "Challenge a friend" button. On a phone it opens the share menu (navigator.share) with "I scored [score] in [game name]! Can you beat me?" and the game URL. On a laptop it copies the same text and shows "Link copied!".
Done when: the share menu opens on my phone, and the text copies on my laptop.
```

**8.6 Norsk / English** 🟢
```
Add a language switch: a TEXT_NO object with Norwegian text and a 🇳🇴/🇬🇧 button on the start screen. Remember the choice. Keep the gameplay the same.
Done when: all text changes language, and the choice stays after a reload.
```

**8.7 Bestemor mode** 🟢
```
Add a "Bestemor mode" toggle on the start screen: bigger hero, slower falling, 5 lives, bigger text. Remember the choice. Bestemor scores do not go to the online leaderboard. Keep normal mode the same.
Done when: Bestemor mode is clearly easier, and normal mode is unchanged.
```

**8.8 Your own idea**
```
Add [your idea]. It should work like this: [how]. Keep the gameplay the same.
Done when: [how you will check it].
```

---

## When something goes wrong
- Type **`/stuck`**. Bob asks you a few questions, then fixes the problem.
- Or describe it yourself:
  ```
  Something is wrong. I did: ___. I expected: ___. I saw: ___. Console error (F12): ___. Fix only this.
  ```
- Bob made it worse? Ask a host to take you back to your last `/save`.
