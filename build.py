import json, os, re, glob, shutil, html, urllib.parse
BD = os.path.join(os.environ['TEMP'], 'bd')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'site')
meta = json.load(open(os.path.join(BD, 'meta.json'), encoding='utf8'))

# nav + footer lifted from the original structure (same links / same URLs)
home = open(os.path.join(BD, 'pages', 'index.html'), encoding='utf8').read()
nav = re.search(r'<nav class="navbar".*?</nav>', home, re.S).group(0)
nav = nav.replace(' style="display:block !important"', '').replace(' style="display:none !important"', ' style="display:none"')
nav = nav.replace('/assets/site-----image-1.webp', '/assets/site-----image-1.webp')
footer = re.search(r'<footer class="site-footer".*?</footer>', home, re.S).group(0)
footer = re.sub(r' style="[^"]*"', '', footer)
footer = re.sub(r' data-[a-z-]+="[^"]*"', '', footer)
footer = footer.replace('נוצר באמצעות Zappy', 'נוצר באמצעות Zappy')

HEAD = '''<!DOCTYPE html>
<html lang="he" dir="rtl"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="index, follow">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="https://bendavidlaw.co.il{path}">
<meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:type" content="website"><meta property="og:locale" content="he_IL">
<link rel="icon" href="/assets/favicon.ico"><link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png"><link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer">
<link rel="stylesheet" href="/styles.css">
</head><body>
<a class="skip-link" href="#main">דלג לתוכן הראשי</a>
'''
TAIL = '''
<a href="https://wa.me/972544544546" class="whatsapp-float" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
<script src="/script.js"></script>
</body></html>
'''

def route(name):
    if name == 'index': return ''
    return name.replace('__', '/')

for f in sorted(glob.glob(os.path.join(BD, 'clean', '*.html'))):
    name = os.path.basename(f)[:-5]
    body = open(f, encoding='utf8').read()
    # mobile hero image: use <picture> for the home hero
    body = re.sub(r'<img ([^>]*?)data-zappy-mobile-src="([^"?]+)[^"]*"([^>]*?)src="([^"?]+)[^"]*"([^>]*)/?>',
                  r'<picture><source media="(max-width:700px)" srcset="\2"><img \1\3src="\4"\5></picture>', body)
    body = re.sub(r'\s*data-zappy-mobile-src="[^"]*"', '', body)
    body = body.replace('viewbox=', 'viewBox=').replace('preserveaspectratio=', 'preserveAspectRatio=')
    body = re.sub(r'\?v=\d+', '', body)
    m = meta[name]
    path = '/' + route(name)
    page = HEAD.format(title=html.escape(m['title']), desc=html.escape(m['desc'], quote=True), path=urllib.parse.quote(path, safe='/')) \
        + nav + '\n<main id="main">\n' + body + '\n</main>\n' + footer + TAIL
    page = re.sub(r'\?v=\d+', '', page)
    d = os.path.join(OUT, *route(name).split('/')) if name != 'index' else OUT
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, 'index.html'), 'w', encoding='utf8').write(page)
    print('built', path or '/')

# sitemap + robots
smap = open(os.path.join(BD, 'sitemap.xml'), encoding='utf8').read()
open(os.path.join(OUT, 'sitemap.xml'), 'w', encoding='utf8').write(smap)
open(os.path.join(OUT, 'robots.txt'), 'w').write('User-agent: *\nAllow: /\nSitemap: https://bendavidlaw.co.il/sitemap.xml\n')
