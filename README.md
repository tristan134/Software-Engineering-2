# Journeo – Reiseplaner (SE2)

> Dieses Repository wurde im Rahmen einer Lehrveranstaltung erstellt und dient ausschließlich akademischen Zwecken.
> Der enthaltene Code stellt kein produktionsreifes System dar und ist nicht für den Einsatz in produktiven Umgebungen vorgesehen.
> Es wird keine Garantie für Korrektheit, Vollständigkeit oder Sicherheit übernommen.

## Überblick

**Journeo** ist ein einfacher Reiseplaner mit REST-API (FastAPI) und einem Web-Frontend (Vite). Eine Reise besteht aus Tagen, und ein Tag kann mehrere Aktivitäten enthalten.

### Use-Cases

- Reise erstellen
- Reise bearbeiten
- Reise löschen
- Reiseverlauf anzeigen

## Tech-Stack

**Backend**
- Python 3.12
- FastAPI + Uvicorn
- SQLAlchemy
- PostgreSQL
- Tests: pytest + httpx

**Frontend**
- Vite
- HTML/CSS/JavaScript
- OpenAPI Generator (typescript-fetch Client nach `src/generated/`)

## Projektstruktur (kurz)

- `backend/` – FastAPI App, DB-Modelle, API-Routen, Tests
- `frontend/` – Vite App (statischer Build via Nginx im Container)
- `docker-compose*.yml` – Composer Setups (Images vs. lokal bauen)

## Voraussetzungen

- Docker + Docker Compose

Optional (für lokale Entwicklung ohne Docker):
- Python 3.12
- Node.js >= 20

## Konfiguration (.env)

Die Docker-Compose Dateien erwarten eine `.env` Datei im Repo-Root.

- Beispiel: `.env.example`
- Erstelle eine eigene `.env` (Passwort bitte ändern):

```bash
cp .env.example .env
```

## Starten mit Docker Compose

Es gibt zwei Compose-Varianten:

### 1) Mit fertigen Images (Standard)

Startet DB + Backend + Frontend über Images:

```bash
docker compose up -d
```

### 2) Lokal bauen (für Entwicklung)

Baut Backend/Frontend aus diesem Repo und startet dann:

```bash
docker compose -f docker-compose.local.yml up -d --build
```

### URLs

- Frontend: http://localhost:8080
- Backend (API): http://localhost:8000
- OpenAPI/Swagger UI: http://localhost:8000/docs
- OpenAPI JSON: http://localhost:8000/openapi.json

### Lizenz / Hinweis

Nur für akademische Zwecke.
