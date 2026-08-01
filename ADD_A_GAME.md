# adding a new game - notes to self

so future-me doesn't have to reverse-engineer this at 1am. steps:

## 1. assets

make a new folder under `assets/` named after the game, e.g.:

```
assets/MyNewGame/
assets/MyNewGame/banner.png
assets/MyNewGame/screenshots/1.png
assets/MyNewGame/screenshots/2.png
assets/MyNewGame/screenshots/3.png
assets/MyNewGame/screenshots/4.png
```

doesn't have to be exactly 4 screenshots, just add/remove `<button>` blocks
in step 2 to match however many I've got.

## 2. index.html

open `index.html`, find the games section (search for `game-list`). there's
a big HTML comment right above it explaining this same thing, and the
System Siege `<article class="game-card">...</article>` block is marked
with:

```
<!-- ===== System Siege RTS — copy this whole <article> to add the next game ===== -->
...
<!-- ===== end System Siege RTS ===== -->
```

copy that whole block (both comment markers and everything between them),
paste it right after the `</article>` of the previous game but still
inside `<div class="game-list">`, then just go through and swap:

- the two `assets/SystemSiege/...` paths → `assets/MyNewGame/...`
- the `<h3 class="sr-only">` game name
- the tagline + copy paragraphs
- the CTA links (itch page, community board, whatever's real for this one)
- the screenshot alt text / count

each game card can look totally different if I want — the colours are all
scoped inside `.game-card` so a second game could use a completely
different palette without touching the first one. copy the game-card CSS
rules in `styles.css` under a new class if I want that (e.g. `.game-card--
neon` or whatever) and swap the class on the new `<article>`.

## 3. the "Recent" bar

it's static HTML for the game entries (only the video ones update
automatically). add a second pill next to the System Siege one in the
hero:

```html
<a href="#games" class="recent-pill">Game: My New Game</a>
```

(both game pills can just point at `#games` — no need for per-game anchors
unless the list gets long enough to want deep links, in which case give
each `<article>` an `id` and point the pill at `#that-id` instead)

## 4. that's it

no build step, no JS to touch for this part. push it up and it's live.
