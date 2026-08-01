# site notes

single-page static site, no build step. studio shell (yellow/black/white,
Carlito) + a Games section (System Siege RTS boxed on its own, more games
later) + a Recent YouTubes section pulling from my channel automatically.

## links already wired up

- both "Play Free Web Version" and "Download the Free Windows Version" go
  to `https://jokesonyouisuck.itch.io/system-siege` on purpose - that page
  has both the web player and the windows download, so both buttons lead
  to the same place.
- "Get on the Android Store (Coming Soon)" is a dead, non-clicking element
  on purpose - swap it for a real `<a href>` once there's actually
  somewhere for it to point.
- community board button → `https://jokesonyouisuck.itch.io/system-siege/community`
- subscribe button → `https://www.youtube.com/@YourTimeMatters`

## assets

see `assets/README.txt` for exactly what goes where. short version: studio
stuff (logo, channel banner) sits directly in `assets/`, each game gets
its own folder like `assets/SystemSiege/`.

## adding a second game later

see `ADD_A_GAME.md`. short version: duplicate the game-card block in
`index.html`, point it at a new `assets/<GameName>/` folder, done.

## how the youtube section pulls videos in

no iframe embed (that's what caused the local "Error 153" thing early on).
instead:

1. `.github/workflows/update-videos.yml` runs `scripts/fetch_videos.py`
   every 6 hours, or whenever I trigger it manually from the Actions tab.
2. that script hits my channel's public rss feed (no api key needed),
   grabs the latest 6 videos (title/link/thumbnail/description), strips
   the promo blurb off the front of each description, and writes the
   result to `data/videos.json`.
3. if anything changed, the workflow commits that file back to the repo.
4. `script.js` does a plain `fetch('data/videos.json')` in the browser and
   builds the video cards + "Recent" nav pills from it.

**one-time repo setting I needed:** Settings → Actions → General → Workflow
permissions → "Read and write permissions", or the commit step silently
fails.

**first sync:** Actions tab → "Update YouTube videos" → Run workflow,
don't wait for the schedule.

## testing locally before pushing

`data/videos.json` starts as `[]` in the repo (gets overwritten by the
action once it's live). to actually see what the video section looks like
before pushing anything to github:

```
cp data/videos.sample.json data/videos.json
python3 -m http.server 8000
```

then open `http://localhost:8000`. `videos.sample.json` is fake data, just
for eyeballing the layout - remember to put `data/videos.json` back to `[]`
(or just let it get overwritten by the real action after pushing) so I
don't accidentally ship fake video titles.

plain double-clicking `index.html` opens it as a `file://` url, and the
browser blocks `fetch()` of local files under `file://` - that's why the
local server step matters, it's not optional for testing this part.

## publishing on github pages

1. new **public** repo named exactly `joyisgaming.github.io`
2. push everything in this folder to `main`
3. Settings → Pages → source = deploy from branch → `main` / root
4. live at `https://joyisgaming.github.io` in a minute or two

## pointing the real domain at it

1. edit `CNAME` in the repo, put the actual domain in it
2. at the registrar, A records (apex domain) →
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```
   and a CNAME record for `www` → `joyisgaming.github.io`
3. Settings → Pages → enter the custom domain, save, wait for DNS, then
   tick Enforce HTTPS once it's available
