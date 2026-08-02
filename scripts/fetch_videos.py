"""
grabs my youtube channel's rss feed and dumps the latest videos into
data/videos.json so the site can just fetch() it - no api key, no
third-party proxy, nothing to pay for or lose access to.

run it by hand with: python3 scripts/fetch_videos.py
normally it just runs on a schedule via .github/workflows/update-videos.yml
"""

import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

CHANNEL_ID = "UCNEmdbYto0aNkmrDfDStxbA"  # @YourTimeMatters
FEED_URL = f"https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}"
MAX_VIDEOS = 6
DESCRIPTION_LIMIT = 420
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "data" / "videos.json"

NS = {
    "atom": "http://www.w3.org/2005/Atom",
    "yt": "http://www.youtube.com/xml/schemas/2015",
    "media": "http://search.yahoo.com/mrss/",
}

# every video description starts with the same promo blurb about the game -
# strip that (and the blank/dot separator lines under it) so only the actual
# per-video text shows up on the site
PROMO_ANCHOR = "jokesonyouisuck.itch.io/system-siege"

# some descriptions have a long "====...====" divider further down (before
# timestamps/links/whatever) - cut everything from there onward so it
# doesn't bloat the excerpt on the site
SEPARATOR_PATTERN = re.compile(r"=\s*={9,}")


def strip_promo(description: str) -> str:
    if not description:
        return ""
    idx = description.lower().find(PROMO_ANCHOR.lower())
    if idx == -1:
        return description.strip()

    rest = description[idx + len(PROMO_ANCHOR):]
    lines = rest.splitlines()

    i = 0
    while i < len(lines) and lines[i].strip() in ("", "."):
        i += 1

    return "\n".join(lines[i:]).strip()


def cut_at_separator(text: str) -> str:
    match = SEPARATOR_PATTERN.search(text)
    if match:
        return text[:match.start()].strip()
    return text


def truncate(text: str, limit: int = DESCRIPTION_LIMIT) -> str:
    text = text.strip()
    if len(text) <= limit:
        return text
    cut = text[:limit]
    last_space = cut.rfind(" ")
    if last_space > 0:
        cut = cut[:last_space]
    return cut.rstrip() + "…"


def clean_thumbnail(url: str) -> str:
    # hqdefault is 4:3 with letterboxing baked in - mqdefault is true 16:9
    # and just about always available, so swap it regardless of source
    return url.replace("hqdefault", "mqdefault")


def fetch_feed(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return resp.read()


def parse_feed(xml_bytes: bytes) -> list[dict]:
    root = ET.fromstring(xml_bytes)
    videos = []

    for entry in root.findall("atom:entry", NS)[:MAX_VIDEOS]:
        video_id_el = entry.find("yt:videoId", NS)
        title_el = entry.find("atom:title", NS)
        published_el = entry.find("atom:published", NS)
        media_group = entry.find("media:group", NS)

        if video_id_el is None or title_el is None:
            continue

        video_id = video_id_el.text
        thumbnail_url = f"https://i.ytimg.com/vi/{video_id}/mqdefault.jpg"
        raw_description = ""
        if media_group is not None:
            thumb_el = media_group.find("media:thumbnail", NS)
            if thumb_el is not None and "url" in thumb_el.attrib:
                thumbnail_url = thumb_el.attrib["url"]

            desc_el = media_group.find("media:description", NS)
            if desc_el is not None and desc_el.text:
                raw_description = desc_el.text

        thumbnail_url = clean_thumbnail(thumbnail_url)
        description = truncate(cut_at_separator(strip_promo(raw_description)))

        videos.append({
            "id": video_id,
            "title": title_el.text,
            "url": f"https://www.youtube.com/watch?v={video_id}",
            "thumbnail": thumbnail_url,
            "description": description,
            "published": published_el.text if published_el is not None else None,
        })

    return videos


def main():
    xml_bytes = fetch_feed(FEED_URL)
    videos = parse_feed(xml_bytes)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(videos, indent=2), encoding="utf-8")
    print(f"wrote {len(videos)} videos to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
