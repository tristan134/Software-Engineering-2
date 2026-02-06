Reise Planer:

Usecases:
- Reise erstelle
- Reise bearbeiten (+Bild hinzufügen)
- Reise löschen
- Reiseverlauf anzeigen, vertikal

(Zeitstrahl)



Backend:
- Python mit REST API (FastAPI Bibliothek)
- PostgreSQL (SQLalchemy)
- Dockerfile

Frontend:
- HTML, CSS, JS

Verbindung zu Frontend/Backend über OpenAPI Generator


Ordnerstruktur:

SE2/
    -.gitignore
    -backend/
	 - App.py 	# Zentrale Logik, App-Generierung mit FastAPI, API Schnittstelle mit REST-API
	 - database.py	# PostgreSQL mit dem Paket SQLalchemy
	 - models.py	# Datenbanktabellenstruktur
	 - schemas.py	# Datenstruktur, mit Paket pydantic
	 - routers/
		- travel.py	# API Endpunkte
	 - uploads/		# Bilder für die Reise
		- ...
	 - Dockerfile
    -frontend/
	 - static/
		- css
		- js
		- img/
	 - templates/
		- html
	 - openapi.json (?)
	 - Dockerfile
    -docker-compose.yml




GitHub Actions:
_ Ruff Python Linter (Code Formatting)
- Static Analysis
