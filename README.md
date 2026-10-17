# TestLoom - Modern Exam Preparation Platform

Modern, fast, and scalable exam preparation platform (IELTS, PTE, TOEFL, GRE).

## Project Overview
- **Technology Stack:** Single Page Application (SPA) built with React, Vite, and Tailwind CSS.
- **Downloaded Resources:**
  - `index.html`: Main SPA application template with all stylesheets and meta headers.
  - `assets/`: Contains over 500 bundles, chunks, stylesheets, WebP icons, SVG graphics, and interactive module scripts covering:
    - IELTS Listening, Reading, Writing, Speaking practice and mock tests
    - AI Speaking & Partner modules
    - Test Studio, Results & Performance Reports, Test experience interfaces
    - Admin, Center, and Student portals
    - Theme vars (Nick Wilde, Zootopia Blue, Savanna Gold, Night Howler)
  - `manifest.webmanifest`: Progressive Web App (PWA) configuration
  - `apple-touch-icon.png` & `favicon.ico`: Platform branding icons
  - `logo.png` & `social.webp`: Official branding and hero assets

## How to Run Locally

### Option 1: Double-click script (Windows)
Double-click `start_server.bat` in this folder.

### Option 2: Python Command Line
Run the included SPA-compatible HTTP server:
```powershell
python server.py
```

Then open your browser and navigate to:
[http://localhost:8000](http://localhost:8000)

*Note: `server.py` includes SPA route rewriting so that direct navigation to subpages (e.g. `/listening`, `/reading`, `/dashboard`) seamlessly loads the client-side router.*
