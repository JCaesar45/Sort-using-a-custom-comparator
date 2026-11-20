# Maison Aurelle

A small storefront for a fictional house of watches and fragrance. The front page is one self-contained file. Its hero is a working analogue clock that reads your device time, and everything else (catalogue, bag, private list) hangs off that single idea: a luxury brand should feel like it keeps time.

## Product structure

```
maison-aurelle/
├─ package.json          scripts and dev dependencies
├─ tsconfig.json         strict type checking for the server
├─ public/
│  └─ index.html         HTML, CSS and JavaScript in one file
├─ server/
│  └─ server.ts          TypeScript HTTP server and JSON API
├─ data/
│  ├─ products.json      catalogue, shared by the server and the report
│  └─ waitlist.csv       created on the first signup
├─ analytics/
│  └─ report.py          Python pricing report
└─ java/
   └─ WaitlistStats.java signup counts by email domain
```

## Run it

```
npm install
npm start
```

Open http://localhost:3000. Other commands:

```
npm run typecheck    # strict TypeScript check
npm run report       # Python pricing report (Python 3.9+)
npm run stats        # signup summary (Java 11+, single-file launch)
```

## API

| Method | Path | Result |
|--------|------|--------|
| GET | /api/products | catalogue as JSON |
| POST | /api/waitlist | body `{"email": "..."}`, answers 201 or 400 |

If the API cannot be reached, the page keeps the address in the browser and says so. Nothing fails silently.

## Method notes

I kept the page dependency-free so it opens from a file or a static host. The clock rotates SVG hands with `requestAnimationFrame` for a sweeping second hand and falls back to one tick per second when the visitor prefers reduced motion. Product text is inserted with `textContent` rather than `innerHTML`, which closes off script injection. The server resolves every static path and rejects anything outside `public/`, caps request bodies at 4 KB, and refuses e-mail values containing commas or quotes so a signup cannot corrupt the CSV file.

## References

Mozilla Developer Network. (n.d.). *Window: requestAnimationFrame() method*. MDN Web Docs. https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame

Node.js. (n.d.). *HTTP*. Node.js documentation. https://nodejs.org/api/http.html

Python Software Foundation. (n.d.). *json: JSON encoder and decoder*. Python documentation. https://docs.python.org/3/library/json.html

World Wide Web Consortium. (2023). *Web content accessibility guidelines (WCAG) 2.2*. https://www.w3.org/TR/WCAG22/
