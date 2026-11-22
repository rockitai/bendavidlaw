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
footer = re.sub(r'\s*<span class="legal-divider">\|</span>\s*<a[^>]*zappy-attribution[^>]*>.*?</a>', '', footer, flags=re.S)
assert 'zappy' not in footer.lower(), 'zappy attribution still in footer'

HEAD = '''<!DOCTYPE html>
<html lang="he" dir="rtl"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="index, follow">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="keywords" content="{kw}">
<link rel="canonical" href="https://bendavidlaw.co.il{path}">
{extras}
{gtm}
<meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:type" content="website"><meta property="og:locale" content="he_IL">
<link rel="icon" href="/assets/favicon.ico"><link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png"><link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer">
<link rel="stylesheet" href="/styles.css">
</head><body>
{gtm_ns}
<a class="skip-link" href="#main">דלג לתוכן הראשי</a>
'''
TAIL = '''
<a href="https://wa.me/972544544546" class="whatsapp-float" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
<script src="/script.js"></script>
</body></html>
'''

from bs4 import BeautifulSoup
def head_extras(name):
    soup = BeautifulSoup(open(os.path.join(BD, 'pages', name + '.html'), encoding='utf8').read(), 'lxml')
    out = []
    for m in soup.head.find_all('meta'):
        k = m.get('property') or m.get('name') or ''
        if k.startswith(('og:', 'twitter:')) or k in ('google-site-verification', 'keywords'):
            if k in ('og:title', 'og:description', 'og:type', 'og:locale', 'keywords'): continue
            x = str(m)
            for a, b in WORDING: x = x.replace(a, b)
            out.append(x)
    out.append('<script type="application/ld+json">' + json.dumps(LD, ensure_ascii=False) + '</script>')
    return '\n'.join(out)

LD = {
    "@context": "https://schema.org",
    "@type": ["LegalService", "LocalBusiness"],
    "@id": "https://bendavidlaw.co.il#organization",
    "name": "אבי בן דוד, עו״ד",
    "url": "https://bendavidlaw.co.il",
    "description": "משרד עו״ד אבי בן דוד, חיפה – דיני משפחה (גירושין, מזונות, משמורת, הסכמי ממון, צוואות וייפוי כוח מתמשך), דינים אישיים, וייצוג פצועי ונכי צה״ל מול משרד הביטחון: ועדות רפואיות, ערעורים והכרה בנכות. ייצוג בכל הארץ. ייעוץ ראשוני ללא התחייבות.",
    "areaServed": "IL",
    "telephone": "+972-4-8669000",
    "email": "avibd@bendavidlaw.co.il",
    "address": {"@type": "PostalAddress", "streetAddress": "שדרות ההסתדרות 66", "addressLocality": "חיפה", "postalCode": "3296052", "addressCountry": "IL"},
    "contactPoint": [{"@type": "ContactPoint", "contactType": "customer service", "email": "Avibd@bendavidlaw.co.il", "telephone": "054-4544546"}],
    "sameAs": ["https://facebook.com/profile.php?id=61586762410240", "https://youtube.com/@AviBenDavid-g9c"],
}
GTM_NOSCRIPT = '<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TN44STVH" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>'

GTM = """<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{'ad_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','analytics_storage':'denied','wait_for_update':500});</script>
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-TN44STVH');</script>"""

WORDING = [
    ('עורך דין מומלץ לענייני משפחה', 'עורך דין לענייני משפחה'),
    ('תחומי התמחות', 'תחומי עיסוק'),
    ('תחומי ההתמחות', 'תחומי העיסוק'),
    ('ועד להשגת התוצאה הטובה ביותרעבורכם', 'ועד להשגת מטרותיכם'),
    ('מומלץ', 'כדאי'),
]

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
    for a, b in WORDING: body = body.replace(a, b)
    m = meta[name]
    m = {k: v for k, v in m.items()}
    for k in ('title', 'desc'):
        for a, b in WORDING: m[k] = m[k].replace(a, b)
    path = '/' + route(name)
    page = HEAD.format(title=html.escape(m['title']), desc=html.escape(m['desc'], quote=True), path=urllib.parse.quote(path, safe='/'), kw='דיני משפחה, גירושים, עורך דין לענייני משפחה, צוואה, משמורת', extras=head_extras(name), gtm=GTM, gtm_ns=GTM_NOSCRIPT) \
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
