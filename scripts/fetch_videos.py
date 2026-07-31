"""
Fetch the channel's YouTube RSS feed and write the latest videos to
data/videos.json as plain JSON, so the static site can load them with a
same-origin fetch() at page-load time (no CORS issues, no API key).

Run manually with: python3 scripts/fetch_videos.py
Normally run on a schedule by .github/workflows/update-videos.yml
"""

import json
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

CHANNEL_ID = "UCNEmdbYto0aNkmrDfDStxbA"  # @YourTimeMatters
FEED_URL = f"https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}"
MAX_VIDEOS = 6
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "data" / "videos.json"

NS = {
    "atom": "http://www.w3.org/2005/Atom",
    "yt": "http://www.youtube.com/xml/schemas/2015",
    "media": "http://search.yahoo.com/mrss/",
}


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
        thumbnail_url = f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
        if media_group is not None:
            thumb_el = media_group.find("media:thumbnail", NS)
            if thumb_el is not None and "url" in thumb_el.attrib:
                thumbnail_url = thumb_el.attrib["url"]

        videos.append({
            "id": video_id,
            "title": title_el.text,
            "url": f"https://www.youtube.com/watch?v={video_id}",
            "thumbnail": thumbnail_url,
            "published": published_el.text if published_el is not None else None,
        })

    return videos


def main():
    xml_bytes = fetch_feed(FEED_URL)
    videos = parse_feed(xml_bytes)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(videos, indent=2), encoding="utf-8")
    print(f"Wrote {len(videos)} videos to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
