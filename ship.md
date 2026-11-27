---
description: Commit all changes and push to GitHub. Vercel deploys from main.
---
1. Run `git status --short`. If nothing changed, say so and stop.
2. Check the changed files for secrets (keys, tokens, passwords, URLs with tokens) and for `.env` or `.vercel/` files. If you find any, stop and report them.
3. Run `node --check` on `game.js`, and on `leaderboard.js` and `api/scores.js` if they exist. If a check fails, stop and report the error.
4. Run `git add -A`, then `git commit -m "<message>"`. Write a short imperative message from the diff, 60 characters or fewer.
5. Run `git push`.
6. Reply in two lines: the commit hash and message, then "Live in about 1 minute. Reload the site on your phone."
