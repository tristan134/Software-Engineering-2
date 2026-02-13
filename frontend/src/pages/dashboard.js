import "../css/dashboard.css";

export function renderDashboardPage({ mount }) {
	mount.innerHTML = `
    <section class="landing">
      <h1>J<i class="fa-solid fa-location-dot"></i>urneo</h1>
      <div id="journeys"></div>
    </section>
  `;

	loadJourneys();
}

async function loadJourneys() {
	const container = document.getElementById("journeys");

	try {
		const res = await fetch("http://localhost:8000/api/v1/journey");
		const journeys = await res.json();

		// Wenn KEINE Reisen existieren → Hinweistext anzeigen
		if (!journeys || journeys.length === 0) {
			container.innerHTML = `
        <p style="padding: 1rem; font-size: 1.1rem;">
          Du hast aktuell noch keine Reise geplant. 🌍✨<br>
          Lege gleich eine neue Reise über <strong>"Reise hinzufügen"</strong> an und starte ins nächste Abenteuer!
        </p>
      `;
			return;
		}

		// Wenn Reisen existieren → Karten rendern
		container.innerHTML = journeys
			.map(
				(j) => `
        <div class="journey-wrapper">
          <div class="card">
            <h3>${j.title}</h3>
            <p>${j.description || "Keine Beschreibung"}</p>
            <p><strong>Preis:</strong> ${formatPrice(j.price)}</p>
            <p><strong>Start:</strong> ${new Date(j.start_date).toLocaleDateString()}</p>
            <p><strong>Ende:</strong> ${new Date(j.end_date).toLocaleDateString()}</p>
            
            <div>
                <button class = "btn" onclick="deleteJourney(${
									j.id
								})">🗑️</button>
                <button class = "btn" onclick="showFullJourney(${
									j.id
								})">👀</button>
                <button class = "btn" onclick="editJourney(${
									j.id
								})">Bearbeiten</button>
            </div>
          </div>
        </div>
      `,
			)
			.join("");
	} catch (err) {
		container.innerHTML = "<p>Fehler beim Laden der Reisen.</p>";
		console.error(err);
	}
}

function formatPrice(p) {
	if (p == null) return "-";
	const num = Number(p);
	if (Number.isNaN(num)) return p;
	return `${num.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €`;
}

function showFullJourney(id) {
	window.location.hash = `#/fulljourney/${id}`;
}
window.showFullJourney = showFullJourney;

async function deleteJourney(id) {
	if (!confirm("Soll diese Reise wirklich gelöscht werden?")) {
		return;
	}

	try {
		await fetch(`http://localhost:8000/api/v1/journey/${id}`, {
			method: "DELETE",
		});

		loadJourneys(); // Dashboard nach dem Löschen aktualisieren
	} catch (err) {
		console.error("Fehler beim Löschen:", err);
	}
}
window.deleteJourney = deleteJourney;

function editJourney(id) {
	// Navigiert zur Edit-Seite
	window.location.hash = `#/editjourney/${id}`;
}
window.editJourney = editJourney;
