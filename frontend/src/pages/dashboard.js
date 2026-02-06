export function renderDashboardPage({ mount }) {
  mount.innerHTML = `
    <section class="landing">
      <h1>🌍 Reiseplaner</h1>
      <div id="journeys"></div>
    </section>
  `;

  loadJourneys();
}

async function loadJourneys() {
  const container = document.getElementById("journeys");

  try {
    const res = await fetch("http://localhost:8000/api/v1/dashboard/all");
    const journeys = await res.json();

    container.innerHTML = journeys
      .map(j => `
        <div class="journey-wrapper">
          <div class="card">
            <h3>${j.title}</h3>
            <p>${j.description || "Keine Beschreibung"}</p>
            <p><strong>Preis:</strong> ${j.price} €</p>
            <p><strong>Start:</strong> ${new Date(j.start_date).toLocaleDateString()}</p>
            <p><strong>Ende:</strong> ${new Date(j.end_date).toLocaleDateString()}</p>
          </div>
        </div>
      `)
      .join("");



  } catch (err) {
    container.innerHTML = "<p>Fehler beim Laden der Reisen.</p>";
    console.error(err);
  }
}
