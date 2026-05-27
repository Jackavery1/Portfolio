"""Remplace le bloc head dupliqué par <!-- HEAD_COMMON --> (usage unique)."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

FAVICON_TAIL = re.compile(
    r"\n\s*(?:<!-- Favicon -->\s*\n\s*)?"
    r'<link\s+rel="icon"[^>]+/>\s*\n\s*'
    r'(?:<!-- Polices -->\s*\n\s*)?'
    r'<link rel="preconnect" href="https://fonts\.googleapis\.com" />\s*\n\s*'
    r'<link rel="preconnect" href="https://fonts\.gstatic\.com"[^/]*/>\s*\n\s*'
    r'<link\s+href="https://fonts\.googleapis\.com[^"]+"\s+rel="stylesheet"\s*/>\s*\n\s*'
    r'<link rel="preload" href="style\.css"[^/]*/>\s*\n\s*'
    r'<link rel="stylesheet" href="style\.css" />\s*',
    re.DOTALL,
)

THEME_TO_CANONICAL = re.compile(
    r'    <meta name="theme-color" content="#03040f" />\s*\n\s*'
    r'<meta property="og:type" content="website" />\s*\n\s*'
    r'(<meta property="og:title"[^>]+ />\s*\n\s*'
    r'<meta\s+property="og:description"[^/]+/>\s*\n\s*)'
    r'<meta property="og:image"[^>]+ />\s*\n\s*'
    r'<meta property="og:locale"[^>]+ />\s*\n\s*'
    r'<meta property="og:url"[^>]+ />\s*\n\s*'
    r'<meta name="twitter:card"[^>]+ />\s*\n\s*'
    r'(<meta name="twitter:title"[^>]+ />\s*\n\s*'
    r'<meta\s+name="twitter:description"[^/]+/>\s*\n\s*)'
    r'<meta name="twitter:image"[^>]+ />\s*\n\s*'
    r'<link rel="canonical"[^>]+ />\s*\n\s*',
    re.DOTALL,
)


def refactor_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    if "<!-- HEAD_COMMON -->" in text:
        return False

    m = THEME_TO_CANONICAL.search(text)
    if not m:
        print(f"skip (pattern): {path.name}")
        return False

    og_block = m.group(1).rstrip()
    tw_block = m.group(2).rstrip()
    rest = text[m.end() :]

    ld = ""
    ld_m = re.search(
        r'(<script type="application/ld\+json">.*?</script>\s*\n)', rest, re.DOTALL
    )
    title_m = re.search(r"(<title>[^<]+</title>)", rest)
    if not title_m:
        print(f"skip (no title): {path.name}")
        return False

    if ld_m and ld_m.start() < title_m.start():
        ld = ld_m.group(1)

    title = title_m.group(1)
    replacement = (
        f"    {og_block}\n"
        f"    {tw_block}\n\n"
        f"    {title}\n\n"
        f"{ld}"
        f"    <!-- HEAD_COMMON -->\n"
    )

    new_text = text[: m.start()] + replacement + rest[title_m.end() :]
    new_text = FAVICON_TAIL.sub("\n", new_text)
    path.write_text(new_text, encoding="utf-8")
    return True


def main():
    for html in sorted(ROOT.glob("*.html")):
        if refactor_file(html):
            print(f"ok: {html.name}")


if __name__ == "__main__":
    main()
