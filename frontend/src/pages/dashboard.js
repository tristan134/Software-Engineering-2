export function renderDashboardPage({ mount }) {
  mount.innerHTML = `
    <section class="landing">
      <h1>🌍 Reiseplaner TESt</h1>
      <div id="journeys"></div>
    </section>
  `;

  loadJourneys();
}

async function loadJourneys() {
  const container = document.getElementById("journeys");

  try {
    const res = await fetch("http://localhost:8000/api/v1/dashboard/journeys");
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
      .map(j => `
        <div class="journey-wrapper">
          <div class="card">
            <h3>${j.title}</h3>
            <p>${j.description || "Keine Beschreibung"}</p>
            <p><strong>Preis:</strong> ${j.price} €</p>
            <p><strong>Start:</strong> ${new Date(j.start_date).toLocaleDateString()}</p>
            <p><strong>Ende:</strong> ${new Date(j.end_date).toLocaleDateString()}</p>
            
            <div>
                <button class = "btn" onclick="deleteJourney(${j.id})">🗑️</button>
                  <button class="btn" onclick="window.location.hash = '#/fulljourney'">👀</button>
            </div>
          </div>
        </div>
      `)
      .join("");

  } catch (err) {
    container.innerHTML = "<p>Fehler beim Laden der Reisen.</p>";
    console.error(err);
  }
}

// ------------------------------------------------------
// LÖSCHEN EINER REISE
// ------------------------------------------------------
async function deleteJourney(id) {
  if (!confirm("Soll diese Reise wirklich gelöscht werden?")) {
    return;
  }

  try {
    await fetch(`http://localhost:8000/api/v1/dashboard/journeys/${id}`, {
      method: "DELETE"
    });

    loadJourneys(); // Dashboard nach dem Löschen aktualisieren

  } catch (err) {
    console.error("Fehler beim Löschen:", err);
  }
}

window.deleteJourney = deleteJourney;
