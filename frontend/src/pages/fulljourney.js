export async function renderFullJourney({ mount }) {
  const hash = window.location.hash;
  const id = hash.split("/")[2];

  if (!id) {
    mount.innerHTML = "<p>❌ Keine Reise-ID in der URL gefunden.</p>";
    return;
  }

  try {
    const res = await fetch(`http://localhost:8000/api/v1/dashboard/journeys/${id}`);

    if (!res.ok) {
      mount.innerHTML = "<p>❌ Reise konnte nicht geladen werden.</p>";
      return;
    }

    const journey = await res.json();

    mount.innerHTML = `
      <section class="landing">
        <h1>${journey.title}</h1>

        <p>${journey.description || "Keine Beschreibung"}</p>

        <p><strong>Preis:</strong> ${journey.price ?? "-"} €</p>
        <p><strong>Start:</strong> ${formatDate(journey.start_date)}</p>
        <p><strong>Ende:</strong> ${formatDate(journey.end_date)}</p>

        <h2 style="margin-top: 32px;">Tage</h2>

        ${journey.days.length === 0
          ? "<p>Noch keine Tage hinzugefügt.</p>"
          : journey.days.map(renderDay).join("")}
      </section>
    `;
  } catch (err) {
    console.error(err);
    mount.innerHTML = "<p>❌ Fehler beim Laden der Seite.</p>";
  }
}

function renderDay(day) {
  return `
    <div style="
      padding: 16px;
      margin: 16px 0;
      background: #fff8f0;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    ">
      <h3>${day.title}</h3>
      <p><strong>Datum:</strong> ${formatDate(day.date)}</p>

      <h4 style="margin-top: 16px;">Aktivitäten</h4>

      ${day.activities.length === 0 
        ? "<p>Keine Aktivitäten vorhanden.</p>"
        : day.activities.map(renderActivity).join("")}
    </div>
  `;
}

function renderActivity(activity) {
  return `
    <div style="
      padding: 10px;
      margin: 10px 0;
      background: white;
      border-left: 5px solid #dcc191;
      border-radius: 6px;
    ">
      <p><strong>${activity.title}</strong></p>
      <p>${activity.start_time || ""} – ${activity.end_time || ""}</p>

      <h5 style="margin-top: 10px;">Dateien</h5>

      ${activity.files.length === 0
        ? "<p>Keine Dateien vorhanden.</p>"
        : activity.files.map(renderFile).join("")}
    </div>
  `;
}

function renderFile(file) {
  return `
    <div style="margin: 4px 0 4px 10px;">
      <a href="${file.file_url}" target="_blank">${file.file_name}</a>
    </div>
  `;
}

function formatDate(str) {
  if (!str) return "-";
  return new Date(str).toLocaleDateString();
}
