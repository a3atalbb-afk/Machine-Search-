# MACHINE SEARCH — Local Web Mockup (Phase 1)

Offline arcade machine code finder. This is the browser-based UI preview
before building the native Android app.

## Run locally (Termux)

    cd ~/MachineSearchWeb
    python -m http.server 8080

Open in phone browser:  http://localhost:8080

## Screens

- index.html      → Home dashboard
- search.html     → Live search (main feature)
- import.html     → Excel import mockup
- info.html       → Database info
- history.html    → Search history
- favorites.html  → Favorite codes
- settings.html   → Settings

## Test searches

Try these queries on search.html:

- prize rush      → should find R_PRIZE_PRIZE RUSH_002
- dance rush      → should find A_DANCE_DANCE RUSH_001
- future field    → should find FUTURE FIELD PRIZE PUSH records
- gold fish       → should find BIG GOLD FISH records
- prize           → all prize records
