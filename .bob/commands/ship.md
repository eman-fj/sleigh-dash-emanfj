---
description: Commit all changes and push to GitHub. Vercel deploys from main.
---
1. Run `git status --short`. If nothing changed, say so and stop.
2. Check the changed files for secrets (keys, tokens, passwords) and for `.env` or `.vercel/` files. If you find any, stop and report them.
3. Run `node --check game.js`. If it fails, stop and report the error.
4. Run `git add -A`, then `git commit -m "<message>"`. Write a short imperative message from the diff, 60 characters or fewer.
5. Run `git push`.
6. Reply in one line: the commit hash and the message.
