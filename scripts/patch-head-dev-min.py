"""Ajoute HEAD_DEV_MIN avant HEAD_COMMON (usage unique)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BLOCK = """    <!-- HEAD_DEV_MIN : retiré au build ; permet d'ouvrir les .html à la racine sans build -->
    <link rel="stylesheet" href="style.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&family=Rajdhani:wght@400;600&display=swap"
      rel="stylesheet"
    />
    <!-- /HEAD_DEV_MIN -->
    <!-- HEAD_COMMON -->"""

for path in sorted(ROOT.glob("*.html")):
    text = path.read_text(encoding="utf-8")
    if "HEAD_DEV_MIN" in text:
        continue
    if "<!-- HEAD_COMMON -->" not in text:
        print("skip", path.name)
        continue
    text = text.replace("    <!-- HEAD_COMMON -->", BLOCK)
    path.write_text(text, encoding="utf-8")
    print("ok", path.name)
