---
name: check
description: Review the game against the spec. Does not edit files.
metadata:
  user-invocable: true
  disable-model-invocation: true
---

Do not edit any file.
1. Run `node --check game.js`.
2. Compare `index.html`, `styles.css` and `game.js` with every "Done when" item of the ticked tasks in @specs/my-game.md.
3. Reply with a table: item | pass or fail | evidence (file and function).
4. List the 3 biggest risks on a phone.
Keep the reply under 25 lines.
