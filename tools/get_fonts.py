"""Download the open-licence (SIL OFL) Google fonts the game uses for signs into assets/fonts/.
Latin fonts: the 'latin' woff2 subset. Japanese fonts: subset to only the characters the signs use."""
import os, re, sys, urllib.request, urllib.parse

OUT = "assets/fonts"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
LATIN = [  # (family, weight, file)
    ("Bebas Neue", 400, "bebas-neue"), ("Archivo Black", 400, "archivo-black"), ("Bungee", 400, "bungee"),
    ("Shrikhand", 400, "shrikhand"), ("Righteous", 400, "righteous"), ("Permanent Marker", 400, "permanent-marker"),
    ("Caveat", 700, "caveat-bold"), ("VT323", 400, "vt323"), ("Oswald", 600, "oswald-semibold"),
    ("Roboto Condensed", 400, "roboto-condensed"), ("Cinzel", 700, "cinzel-bold"), ("Pacifico", 400, "pacifico"),
    ("Alfa Slab One", 400, "alfa-slab-one"), ("Fredoka", 600, "fredoka-semibold"), ("Black Ops One", 400, "black-ops-one"),
    ("Cormorant Garamond", 600, "cormorant-semibold"), ("Marcellus", 400, "marcellus"), ("Josefin Sans", 600, "josefin-semibold"),
]
JP_TEXT = "茶菓子そば甘味和紙漬物団子酒祭大売出信用金庫本舗月見屋小料理夢膳や灯楽スナック鈴カラオケ歌声パブ星桜やきとりおでん炭火焼もつ生ビールホルモン居酒営業中名物煮込み串定食ラーメン餃子立飲みつ地下階うど天丼親海老麦庵手打円梅サワ冷温限特製汁ひばり資源回収有㈲()作業服用品ハタラク商会・"
JP = [("Yuji Syuku", 400, "yuji-syuku"), ("Zen Antique", 400, "zen-antique")]

def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=30).read()

def css(family, weight, text=None):
    q = f"family={urllib.parse.quote(family)}:wght@{weight}" if weight != 400 else f"family={urllib.parse.quote(family)}"
    if text:
        q += "&text=" + urllib.parse.quote(text)
    return get(f"https://fonts.googleapis.com/css2?{q}&display=swap").decode()

for fam, w, name in LATIN:
    c = css(fam, w)
    blocks = re.split(r"/\* (\S+) \*/", c)
    url = None
    for i in range(1, len(blocks), 2):
        if blocks[i] == "latin":
            url = re.search(r"url\((\S+?)\)", blocks[i + 1]).group(1)
    url = url or re.search(r"url\((\S+?)\)", c).group(1)
    open(os.path.join(OUT, name + ".woff2"), "wb").write(get(url))
    print("got", name)
for fam, w, name in JP:
    c = css(fam, w, JP_TEXT)
    url = re.search(r"url\((\S+?)\)", c).group(1)
    data = get(url)
    ext = "woff2" if "woff2" in c else "ttf"
    open(os.path.join(OUT, f"{name}.{ext}"), "wb").write(data)
    print("got", name, ext, len(data))
