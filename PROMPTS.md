# 🎄 Sip n Vibe: your prompt cards

**How to use a card**
1. Copy the prompt.
2. Change the parts in **[brackets]** to your own choices.
3. Paste it into Bob and press Enter.
4. Read what Bob wants to change, then approve.
5. Test it: double-click `index.html` (or press F5 to reload it).

Every prompt has 4 parts: **What** you want · **How** it should work · **Context** (the files Bob reads) · **Done when** (how you check it).

**Helper commands:** `/save` saves a checkpoint · `/stuck` makes Bob ask you questions and fix the problem · `/ship` puts your latest version online · `/clear` starts fresh (do this between labs).

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
/clea
```

Open `specs/my-game.md` and read it. **This is your plan.** Do you want to change something? Edit the file yourself, or ask Bob:

**2.2 Change your plan** (optional)
```
Change my spec: [make it easier for kids / add a rare ⭐ worth 10 points / start with 5 lives]. Only edit specs/my-game.md.
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

📱 Open the URL on your phone. Send it to someone!

---

## Lab 5 · Christmas magic (pick 1 or 2)
Type `/clear` first. Use one card per round, test it, then type `/ship`. Your phone gets the new version about a minute later.

**❄️ Let it snow**
```
Add gentle falling snow in the background: 60 flakes on a laptop, 30 on a phone, with a little sideways drift. Keep the gameplay the same.
Done when: I see snow on the start screen, during play and at game over.
```

**🔔 Jingle sounds**
```
Add sound with the Web Audio API, no sound files: a happy blip when I catch something, a low thud when I hit the bad thing, and three falling notes at game over. Add a 🔊/🔇 button in the top-right corner that remembers my choice. Keep the gameplay the same.
Done when: I hear the sounds after I press Start (also on my phone), and mute still works after a reload.
```

**✨ Juice it up**
```
When I catch something, show "+points" in gold that floats up and fades out. When I hit the bad thing, shake the screen a little and vibrate the phone. Keep the gameplay the same.
Done when: catching shows floating points and a hit shakes the screen.
```

**💌 Christmas postcard**
```
On the game over screen, add a "Make a postcard" button. It draws a Christmas card with my game name, my hero, my score and "God jul!", and downloads it as a PNG. Keep the gameplay the same.
Done when: I press the button and a postcard image downloads.
```

**📲 Invite friends**
```
On the start screen and the game over screen, add a "Challenge a friend" button. On a phone it opens the share menu (navigator.share) with my score and the game URL. On a laptop it copies the link and shows "Link copied!".
Done when: the share menu opens on my phone and the link copies on my laptop.
```

**🏆 Party leaderboard**
```
Add a top 5 leaderboard on this device. At game over, if my score is in the top 5, ask for a name (max 12 letters) and save it. Show the leaderboard on the start screen. Keep the gameplay the same.
Done when: after 2 rounds with different names, both show in the right order, also after a reload.
```

**🇳🇴 Norsk / English**
```
Add a language switch: a TEXT_NO object with Norwegian text and a 🇳🇴/🇬🇧 button on the start screen. Remember the choice. Keep the gameplay the same.
Done when: all text changes language and the choice stays after a reload.
```

**⭐ Golden star**
```
Add a rare golden ⭐ that falls fast and is worth 10 points. It appears about once every 20 items. Keep the rest the same.
Done when: I see a star now and then, and catching it gives 10 points.
```

**🧓 Bestemor mode**
```
Add a "Bestemor mode" toggle on the start screen: bigger hero, slower falling, 5 lives, bigger text. Remember the choice. Keep normal mode the same.
Done when: Bestemor mode is clearly easier, and normal mode is unchanged.
```

**🎨 Your own idea**
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
