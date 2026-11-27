---
name: save
description: Save a checkpoint of your game with git (no push)
metadata:
  user-invocable: true
  disable-model-invocation: true
---

Save a checkpoint of my game.
1. If this folder is not a git repo, run `git init -b main`.
2. Run `git status --short`. If nothing changed, tell me and stop.
3. Run `git add -A`, then `git commit -m "<message>"`. Write a short message that says what changed in my game, 60 characters or fewer.
4. Do not push.
5. Explain in one sentence what a commit is, then show the commit hash.
