# 🍶 Bottle Battle — School PET Bottle Competition System

A production-ready, full-stack web app for running a PET bottle recycling
competition between classrooms at a secondary school. Built with plain
HTML5 / CSS3 / vanilla ES6 on the frontend and Google Apps Script + Google
Sheets on the backend — no build step, no frameworks, no paid hosting.

![Theme](https://img.shields.io/badge/theme-Eco%20Tech-12b76a) ![Stack](https://img.shields.io/badge/stack-Vanilla%20JS%20%2B%20GAS-0ba5ec)

---

## ✨ Features

The app follows a **sidebar app-shell**: every screen below shares one
left-hand navigation (icon + Thai/English label, live clock, "Submit" CTA),
built once in `js/sidebar.js` and injected into each page — edit the nav in
one place and every page updates.

| Page | Highlights |
|---|---|
| **Home Site** (`index.html`) | Public marketing landing: hero banner, animated stats, feature grid (no sidebar) |
| **หน้าแรก / Home** (`dashboard.html`) | KPI strip, top-3 ranking teaser, quick links to every screen below |
| **เส้นทางขวดใส / Bottle Journey** (`journey.html`) | The 6-stage programme pipeline, config-driven |
| **อันดับห้องเรียน / Battle Ranking** (`ranking.html`) | Top-3 podium, full leaderboard, rank-movement arrows, confetti on a new #1 |
| **ภาพรวมรายวัน / Daily Overview** (`daily.html`) | Today's totals, 7-day trend chart, best/worst classroom, daily breakdown table |
| **วิเคราะห์คาร์บอน / Carbon Analytics** (`carbon.html`) | Monthly/weekly tabs, goal-progress ring, computed trend insight, per-classroom breakdown |
| **แผนที่จุดรับขวด / Bottle Map** (`map.html`) | Campus map with configurable collection points |
| **คลังกิจกรรม / Gallery** (`gallery.html`) | Activity photo grid (placeholder tiles until real photos are wired in) |
| **นวัตกรรม / Innovation** (`innovation.html`) | The Bottle Start → Carbon Goal data pipeline explained |
| **หลักฐานและรายงาน / Evidence & Report** (`history.html`) | Search, filter, sort, CSV export, print view, trend chart |
| **ผู้ดูแลระบบ / Admin** (`admin.html`) | Honest pointers to where each setting actually lives (Google Sheet) |
| **ส่งข้อมูลขวด / Submit** (`submit.html`) | Validated collection form, drag-and-drop photo upload, success modal |
| Global | Dark mode, toast notifications, responsive sidebar + navbar, loading screen, custom 404 page |

---

## 📁 Project Structure

```
bottle-battle/
├── index.html               Public marketing landing (no sidebar)
├── dashboard.html            หน้าแรก — Home overview
├── journey.html                เส้นทางขวดใส — Bottle Journey
├── ranking.html                  อันดับห้องเรียน — Battle Ranking
├── daily.html                      ภาพรวมรายวัน — Daily Overview
├── carbon.html                       วิเคราะห์คาร์บอน — Carbon Analytics
├── map.html                            แผนที่จุดรับขวด — Bottle Map
├── gallery.html                          คลังกิจกรรม — Gallery
├── innovation.html                         นวัตกรรม — Innovation
├── history.html                              หลักฐานและรายงาน — Evidence & Report
├── admin.html                                  ผู้ดูแลระบบ — Admin
├── submit.html                                   Collection form (reachable from every sidebar)
├── 404.html                                        Custom error page
├── css/
│   ├── style.css           Global tokens, navbar, hero, footer, toasts
│   ├── dashboard.css        Sidebar app-shell + every widget style (shared by all app pages)
│   ├── ranking.css
│   ├── submit.css
│   └── history.css
├── js/
│   ├── config.js           Editable constants (API URL, classrooms, journey steps, map points, gallery items)
│   ├── api.js                Fetch wrapper for the Apps Script backend
│   ├── main.js                Shared: navbar, theme, toasts, reveal, counters, confetti
│   ├── sidebar.js              Shared sidebar — single source of truth for nav + clock, injected into every app page
│   ├── dashboard.js, journey.js, ranking.js, daily.js, carbon.js, map.js, gallery.js, history.js, submit.js
├── images/
│   ├── favicon.svg
│   └── hero-banner.png     School-provided hero artwork
├── backend/
│   └── Code.gs              Google Apps Script REST API (copy into Apps Script editor)
└── README.md
```

---

## 🎨 Design System

- **Palette:** emerald green (`#12b76a`) → sky blue (`#0ba5ec`) gradient on a
  mint/navy base, with gold/silver/bronze podium accents.
- **Type:** Space Grotesk (display), Inter (body), JetBrains Mono (data/stats).
- **Signature element:** an animated SVG "liquid-fill bottle" used in the hero
  and the dashboard goal gauge — the fill height maps directly to real
  progress data.
- **Surfaces:** glassmorphism cards (`backdrop-filter: blur`), rounded
  corners, soft/strong shadow tokens, full dark-mode palette via
  `[data-theme="dark"]`.

---

## 🚀 Getting Started

### 1. Backend — Google Apps Script + Google Sheets

1. Create a new Google Sheet (this will be your database) — e.g. **"Bottle
   Battle DB"**.
2. Open **Extensions → Apps Script**.
3. Delete the default `Code.gs` content and paste in the contents of
   [`backend/Code.gs`](backend/Code.gs) from this repo.
4. In the Apps Script editor, select the `ensureSheets` function from the
   function dropdown and click **Run** once. This creates the
   `CLASSROOMS`, `COLLECTIONS`, `SETTINGS`, `USERS`, and `LOGS` sheets with
   headers and seeds default settings.
5. Open the new **SETTINGS** sheet and update:
   - `API_KEY` — set a private secret string (must match `config.js`).
   - `SEASON_TARGET_KG` — the school-wide collection goal.
   - `CO2_PER_KG_PET`, `KG_PET_PER_TREE`, `POINTS_PER_KG` — tune the scoring
     and environmental-impact formulas if needed.
   - `DRIVE_FOLDER_ID` — (optional) the ID of a Google Drive folder where
     evidence photos should be stored. Leave blank to use your Drive root.
6. Deploy as a Web App:
   - **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy** and copy the generated `/exec` URL.

> ⚠️ Because Apps Script Web Apps can't set custom CORS headers, the
> frontend avoids preflighted requests by sending `GET` requests with query
> parameters and `POST` requests with a `text/plain` body (see `js/api.js`).
> Don't add custom request headers to `fetch()` calls or the browser will
> trigger a blocked CORS preflight.

### 2. Frontend — GitHub Pages

1. Edit `js/config.js`:
   ```js
   API_BASE_URL: 'https://script.google.com/macros/s/XXXXXXXX/exec',
   API_KEY: 'the-same-secret-you-set-in-SETTINGS',
   CLASSROOMS: [ /* your school's actual classroom list */ ],
   ```
2. Push the project to a GitHub repository.
3. Go to **Settings → Pages**, set the source to your default branch and
   root folder, and save.
4. Your site will be live at `https://<username>.github.io/<repo>/`.

### 3. Local Preview

No build tools are required. Serve the folder with any static server, e.g.:

```bash
npx serve .
# or
python3 -m http.server 8080
```

---

## 🔌 API Reference

All endpoints are served from a single Apps Script Web App URL.

| Action | Method | Params / Body | Description |
|---|---|---|---|
| `getSummary` | GET | — | Dashboard KPI totals |
| `getRanking` | GET | — | Full classroom leaderboard with rank movement |
| `getStatistics` | GET | `range=monthly\|weekly` | Chart-ready time series + classroom share |
| `getCarbonReduction` | GET | — | Total + per-classroom CO₂ savings |
| `getDailyOverview` | GET | — | Today's totals, a 7-day trend, and the top/bottom classroom of the day |
| `getHistory` | GET | `search, classroom, dateFrom, dateTo` | Full collection log |
| `submitCollection` | POST | `{ apiKey, record: { studentName, classroom, weightKg, collectionDate, notes, imageId } }` | Add a new collection |
| `uploadImage` | POST | `{ apiKey, file: { fileName, mimeType, base64 } }` | Store an evidence photo in Drive |

Every response has the shape `{ "success": true, "data": ... }` or
`{ "success": false, "message": "..." }`.

---

## 🗄️ Google Sheets Schema

**CLASSROOMS** — `ClassroomID | ClassroomName | Grade | AdvisorTeacher | CreatedAt`
**COLLECTIONS** — `CollectionID | Timestamp | StudentName | Classroom | WeightKg | CollectionDate | Notes | ImageId | ImageUrl | Points | Status`
**SETTINGS** — `Key | Value`
**USERS** — `UserId | Name | Role | Email | CreatedAt`
**LOGS** — `Timestamp | Action | Detail | Status`

---

## 🌱 Scoring & Environmental Formulas

- **Points** = `weightKg × POINTS_PER_KG` (default 10 pts/kg)
- **CO₂ avoided** = `weightKg × CO2_PER_KG_PET` (default 1.5 kg CO₂e per kg PET)
- **Trees equivalent** = `floor(totalWeightKg / KG_PET_PER_TREE)` (default 20 kg ≈ 1 tree)

All factors are editable from the `SETTINGS` sheet without touching code.

---

## ♿ Accessibility & Performance

- Skip-to-content link, visible focus rings, `aria-live` toasts.
- `prefers-reduced-motion` respected — animations shorten automatically.
- Semantic headings, labeled form fields, alt text on evidence images.
- No render-blocking frameworks; charts load from a single CDN script.

---

## 🛠️ Tech Notes

- Charts use [Chart.js](https://www.chartjs.org/) via CDN — the only
  external runtime dependency, used purely for `<canvas>` rendering.
- All other code is hand-written vanilla JS (ES6 modules-style IIFEs,
  no bundler required).
- Confetti and the liquid-fill bottle gauge are hand-rolled with
  Canvas/SVG — no animation library.

---

## 📄 License

Built for educational use by Baan Suksa Secondary School's Green Team.
Feel free to adapt for your own school's recycling competition.
