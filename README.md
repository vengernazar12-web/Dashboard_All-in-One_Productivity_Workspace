# DASHBOARD

All-in-one dashboard for productivity, AI tools, note taking, TODO management, GitHub search, weather, JSON tools, text processing and media search. Built with Cloudflare Workers and Supabase.

## 🗂 Data Types (TYPES)
Manage and store various data structures:
- **Todo**: `name`, `tag` (optional: `mark`)
- **Note**: `name` (optional: `desc`)
- **URL**: `name`, `url` (optional: `UI image`)
- **Code**: `name`, `lang` (html, css, javascript)
- **Text**: `name`, `txt`
  - *Markup Support:* `@r...r@` (red), `@b...b@` (blue), `@y...y@` (yellow), `@g...g@` (green), `@mark...mark@` (highlight), ` ```...``` ` (code block)
- **Music**: `name`, `musicUrl`

## 🛠 Services (UI Only)

### 🔧 Tools
- **Timezones** & **Exchange Rates**
- **QR-Code Generator**
- **Fetch Service**: Execute HTTP requests with custom URLs, methods, headers, and bodies. Returns full response details (status, final URL, redirection, type, headers, and parsed content).
- **Unit Converter**: Convert length, mass, time, area, volume, speed, data, energy, pressure, and temperature.
- **RegExp Checker**: Live text highlighting with support for RegExp and flags.
- **Compare different text**: Compare different text strings.
- **Compress image**

### 🤖 AI
- **Reasoning AI**: Specialized in complex logic processing.
- **Template AI**: Generates structured templates (README, HTML, .env, Docker Compose, SQL) using provided data.
- **Text to Speech**: AI-powered voice synthesis with 250+ voices.
- **Image Generation**
- **Text Worker**:
  - **AI & Cloning**: AI-driven text manipulation and text cloning.
  - **Analysis**: Word count, length, and text info.
  - **Transformation**: Search & replace, case conversion (UPPERCASE, lowercase, Title Case, iNVERT cASE, camelCase, snake_case, kebab-case), cleanup, and duplicate removal.
  - **Organization**: Line sorting (A-Z, Z-A) and line numbering.
  - **Generators**: UUID, Password (8-32 chars, custom sets), Hash, and Random Numbers.
  - **AI token counter**: 15+ AI families, letter/tokens counter and display tokens

### 🔍 Search
- **Weather**: Live conditions, 3-day forecast, and multi-layer maps.
- **GitHub**: Search users, events, followers, starred, orgs, repos, commits, and file diffs.
- **Wikipedia**: Search titles, descriptions, excerpts, and images.
- **IP Search**: IPv4/IPv6 lookup.
- **Media Search**: Interactive cards for music, podcasts, audiobooks, videos, apps, ebooks, literature, visual media (photos, GIFs), emoji, country, words, recipes, chemical elements, and NASA (with statistics and images).

### 👁 View
- **Browser Worker**: Iframe-based viewer with auto-embed for video/audio.
- **JSON Worker**: JSON tree view, type counting, minification, and CSV/Path export.
- **CSV Render**: Table rendering, HTML export, metadata (columns/rows/cells), and field sorting.

## ⚡ Runner
Utilizes **JSON5** query language to perform actions: `create`, `delete`, `find`, `check`, and `list`.

## 💻 Tech Stack
- **Frontend**: HTML, CSS, JavaScript
- **AI Engine**: Cohere AI
- **Backend & Logic**: Cloudflare Workers, AI, and KV
- **Database & Storage**: Supabase (Tables & Storage)