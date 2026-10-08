# Srijonee Pujo Run

Endless-runner game for Srijonee Durga Pujo. Cloudflare Worker + your D1 database `pujo-run`.

## Go live (about 5 minutes, no command line)
1. Open `wrangler.toml`, replace `PASTE-YOUR-D1-DATABASE-ID-HERE` with the Database ID of `pujo-run`
   (Cloudflare dashboard > Storage & Databases > D1 > pujo-run). It is not a secret.
2. Upload every file in this folder to a new GitHub repo (keep the folders `public` and `src`).
3. Cloudflare dashboard > Workers & Pages > Create > Import a repository > pick the repo.
   - Worker name: `srijonee-pujo-run` (same as `name` in wrangler.toml)
   - Build command: leave empty
   - Deploy command: `npx wrangler deploy`
4. Save and deploy. Your game is live at the `workers.dev` link shown. The leaderboard table is created automatically.

After that, every change you commit to GitHub redeploys the game by itself.

## Managing it
- Change the look or gameplay: edit `public/index.html`
- Change the logo: replace `public/logo.jpg`
- Reset the leaderboard: D1 > pujo-run > Console > `DELETE FROM players;`
- View or edit scores: D1 > pujo-run > Tables > players
- Custom domain: Worker > Settings > Domains & Routes
