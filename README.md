# JOY, IS Gaming — project page

A single-page static site: your brand shell (yellow/black/white, Carlito),
a "Games" section with System Siege RTS in its own boxed card, a "YouTube"
section with a similarly-boxed channel card, and a support section pointing
at the itch community board. No build step — plain HTML/CSS/JS.

## Links already wired up (real, not placeholders)

- Both "Play Free Web Version" and "Download the Free Windows Version"
  point to `https://jokesonyouisuck.itch.io/system-siege` — that's your
  actual itch page, and it hosts both the web player and the Windows
  download, so both buttons intentionally lead to the same place.
- "Get on the Android Store (Coming Soon)" is a disabled, non-clicking
  element on purpose — swap it for a real `<a href>` once there's
  somewhere for it to point.
- The community board button lives inside the game card now (bottom row,
  next to "Built in Godot 4.7") and goes to
  `https://jokesonyouisuck.itch.io/system-siege/community` (confirmed from
  your live itch page).
- "Subscribe on YouTube" points to `https://www.youtube.com/@YourTimeMatters`.

## How the "Recent YouTubes" section works

There's no YouTube iframe embed anymore (that's what caused the local
"Error 153"). Instead:

1. `.github/workflows/update-videos.yml` runs `scripts/fetch_videos.py`
   every 6 hours (and any time you trigger it manually from the repo's
   **Actions** tab).
2. That script fetches your channel's public RSS feed
   (`youtube.com/feeds/videos.xml?channel_id=...`), no API key needed, and
   writes the latest 6 videos (title, link, thumbnail) to `data/videos.json`.
3. If anything changed, the workflow commits that file back to the repo.
4. `script.js`, running in each visitor's browser, does a plain same-origin
   `fetch('data/videos.json')` and renders the video cards and the "Recent"
   nav pills from it. No third-party proxy, no CORS issues, no API key
   shipped to the client.

**One-time repo setting required:** the workflow needs permission to push
its own commits. In your repo, go to **Settings → Actions → General →
Workflow permissions**, and select **"Read and write permissions"**, then
save. Without this, the scheduled run will fetch the data successfully but
fail on the commit/push step.

**To trigger the first sync** without waiting 6 hours: go to the
**Actions** tab → "Update YouTube videos" → **Run workflow**.

## Testing locally

Two separate things both require a real `http://` origin instead of
double-clicking `index.html` (which loads it as `file://`):

- The `fetch('data/videos.json')` call that populates the video grid and
  Recent nav pills — browsers block `fetch()` of local files under `file://`
  by default.
- (No longer applicable for YouTube specifically, since the iframe embed is
  gone — but worth knowing for anything else you embed later.)

Serve the folder locally instead of opening the file directly:
```
python3 -m http.server 8000
```
then visit `http://localhost:8000`. This also matches how GitHub Pages
actually serves the site, so it's the most accurate way to test before
pushing.

## 1. Add your real assets

Drop these into `assets/` — see `assets/README.txt` for details:
- `logo.png` — your JOY, IS Gaming logo
- `banner.gif` — System Siege RTS's animated banner
- `youtube-banner.png` — your channel banner
- `screenshots/1.png` through `4.png`

## 2. About the YouTube embed

The embed uses your channel's auto-generated "uploads" playlist
(`list=UUNEmdbYto0aNkmrDfDStxbA`, derived from your channel ID
`UCNEmdbYto0aNkmrDfDStxbA`) via a plain `videoseries` embed — no API key,
no moving parts. It should show your most recent upload first. If you ever
notice it showing an older video instead, that means YouTube has changed
how that auto-playlist orders itself on their end; the fix at that point
would be pulling in the YouTube Data API for a guaranteed-accurate "latest
video" card, which needs a free API key (restrictable to your domain).

## 3. Publish on GitHub Pages

1. Create a new **public** GitHub repo named exactly:
   `YOUR-GITHUB-USERNAME.github.io`
2. Push everything in this folder to the `main` branch.
3. In the repo, go to **Settings → Pages** and confirm the source is set to
   deploy from `main` (root). Live within a minute or two at
   `https://YOUR-GITHUB-USERNAME.github.io`.

## 4. Point your custom domain at it

1. Edit `CNAME` in this repo — put your actual domain in it (no `https://`,
   no trailing slash).
2. At your registrar's DNS settings, add:

   **A records** (apex domain, e.g. `your-domain.com`) — all four:
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```

   **CNAME record** (for `www.your-domain.com`):
   ```
   your-github-username.github.io
   ```

3. Back in **Settings → Pages**, enter your custom domain and save.
4. Once DNS propagates (usually under an hour), tick **Enforce HTTPS**.

## Notes

- Fonts (Carlito for the studio shell, Chakra Petch/Audiowide inside the
  game card) load from Google Fonts — fine on your own domain, unlike
  itch.io's sandboxed description field.
- The game card intentionally keeps its own distinct sci-fi styling
  (navy/blue, glow) so it reads as "a product," separate from the flatter
  yellow/black/white studio shell around it. When you add a second game,
  copy the `<article class="game-card">...</article>` block and give the
  new copy its own color variables the same way — the yellow shell stays
  constant, each game card gets its own look.
