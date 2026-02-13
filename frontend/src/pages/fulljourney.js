import "../css/fulljourney.css";

export async function renderFullJourney({ mount }) {
	const hash = window.location.hash;
	const id = hash.split("/")[2];

	if (!id) {
		mount.innerHTML = `<p class="alert alert-error">❌ Keine Reise-ID gefunden.</p>`;
		return;
	}

	try {
		const res = await fetch(`http://localhost:8000/api/v1/journeys/${id}`);

		if (!res.ok) {
			mount.innerHTML = `<p class="alert alert-error">❌ Reise konnte nicht geladen werden.</p>`;
			return;
		}

		const journey = await res.json();

		journey.days.sort((a, b) => new Date(a.date) - new Date(b.date));

		mount.innerHTML = `
        <section class="journey-page">

            <div class="journey-header-box">
                <h1 class="journey-title">${journey.title}</h1>

                <p class="journey-description">
                    ${journey.description || "Keine Beschreibung"}
                </p>
                
                <div class="journey-flight-timeline">

                    <div class="flight-item">
                        <span class="flight-icon">🛫</span>
                        <div>
                            <div class="flight-date">${formatDate(journey.start_date)}</div>
                        </div>
                    </div>

                    <div class="flight-line"></div>

                    <div class="flight-item">
                        <span class="flight-icon">🛬</span>
                        <div>
                            <div class="flight-date">${formatDate(journey.end_date)}</div>
                        </div>
                    </div>

                </div>
                
				<p class="journey-price">
					${formatPrice(journey.price)}
				</p>


            </div>
            <div class="timeline">
                ${journey.days.map((d, i) => renderDay(d, i, journey.days.length)).join("")}
            </div>

        </section>
    `;
	} catch (err) {
		console.error(err);
		mount.innerHTML = `<p class="alert alert-error">❌ Fehler beim Laden der Seite.</p>`;
	}
}

function renderDay(day, index, total) {
	return `
    <div class="timeline-item">
        <div class="timeline-marker"></div>
        ${index < total - 1 ? `<div class="timeline-line"></div>` : ""}

        <div class="timeline-content">
            <h3 class="timeline-day-title">${day.title}</h3>
            <p><strong>Datum:</strong> ${formatDate(day.date)}</p>

            <h4 class="timeline-activities-title">Aktivitäten</h4>

            ${
							day.activities.length === 0
								? `<p class="text-muted">Keine Aktivitäten vorhanden.</p>`
								: day.activities.map(renderActivity).join("")
						}
        </div>
    </div>
    `;
}

function renderActivity(activity) {
	const start = formatTime(activity.start_time);
	const end = formatTime(activity.end_time);

	let timeDisplay = "-";
	if (start && end) timeDisplay = `${start} – ${end}`;
	else if (start) timeDisplay = start;

	return `
    <div class="activity-timeline-item">

        <div class="activity-timeline-marker"></div>
        <div class="activity-timeline-line"></div>

        <div class="activity-card">
            <p class="activity-title">${activity.title}</p>
            <p class="activity-time">${timeDisplay}</p>

            <h5 class="activity-files-title">Dateien</h5>

            ${
							activity.files.length === 0
								? `<p class="text-muted">Keine Dateien vorhanden.</p>`
								: activity.files.map(renderFile).join("")
						}
        </div>
    </div>
    `;
}

function renderFile(file) {
	return `
    <div class="activity-file">
        <a href="${file.file_url}" target="_blank">${file.file_name}</a>
    </div>
    `;
}

function formatPrice(p) {
	if (p == null) return "-";
	const num = Number(p);
	if (Number.isNaN(num)) return p;
	return `${num.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €`;
}

function formatDate(str) {
	if (!str) return "-";
	return new Date(str).toLocaleDateString();
}

function formatTime(timeStr) {
	if (!timeStr) return null;
	return timeStr.slice(0, 5);
}
