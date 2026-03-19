import "../css/fulljourney.css";
import { apiUrl } from "../apiBase";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseISODateOnlyToUTC(dateStr) {
	if (!dateStr || typeof dateStr !== "string") return null;
	const dateOnly = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
	const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(dateOnly);
	if (!m) return null;
	const year = Number(m[1]);
	const month = Number(m[2]);
	const day = Number(m[3]);
	if (
		!Number.isInteger(year) ||
		!Number.isInteger(month) ||
		!Number.isInteger(day)
	)
		return null;
	return new Date(Date.UTC(year, month - 1, day));
}

function diffCalendarDaysUTC(a, b) {
	if (!(a instanceof Date) || Number.isNaN(a.getTime())) return null;
	if (!(b instanceof Date) || Number.isNaN(b.getTime())) return null;
	return Math.round((a.getTime() - b.getTime()) / MS_PER_DAY);
}

function getJourneyDayNumber({ journeyStartDate, dayDate }) {
	const start = parseISODateOnlyToUTC(journeyStartDate);
	const day = parseISODateOnlyToUTC(dayDate);
	if (!start || !day) return null;
	const delta = diffCalendarDaysUTC(day, start);
	if (delta == null) return null;
	return delta + 1;
}

export async function renderFullJourney({ mount }) {
	const hash = window.location.hash;
	const id = hash.split("/")[2];

	if (!id) {
		mount.innerHTML = `<p class="alert alert-error">❌ Keine Reise-ID gefunden.</p>`;
		return;
	}

	try {
		const res = await fetch(apiUrl(`/v1/journey/${id}`));

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
                ${journey.days
									.map((d, i) =>
										renderDay(d, i, journey.days.length, {
											journeyStartDate: journey.start_date,
										}),
									)
									.join("")}
            </div>

        </section>
    `;
	} catch (err) {
		console.error(err);
		mount.innerHTML = `<p class="alert alert-error">❌ Fehler beim Laden der Seite.</p>`;
	}
}

function renderDay(day, index, total, { journeyStartDate } = {}) {
	const tagNumber = getJourneyDayNumber({
		journeyStartDate,
		dayDate: day.date,
	});
	const tagLabel = tagNumber != null ? `Tag ${tagNumber}` : `Tag ${index + 1}`;
	const activities = Array.isArray(day.activities) ? day.activities : [];

	return `
    <div class="timeline-item">
        <div class="timeline-marker"></div>
        ${index < total - 1 ? `<div class="timeline-line"></div>` : ""}

        <div class="timeline-content">
            <h3 class="timeline-day-title">${tagLabel}: ${day.title}</h3>
            <p><strong>Datum:</strong> ${formatDate(day.date)}</p>

            <h4 class="timeline-activities-title">Aktivitäten</h4>

            ${
							activities.length === 0
								? `<p class="text-muted">Keine Aktivitäten vorhanden.</p>`
								: activities.map(renderActivity).join("")
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

	const files = Array.isArray(activity.files) ? activity.files : [];

	return `
    <div class="activity-timeline-item">

        <div class="activity-timeline-marker"></div>
        <div class="activity-timeline-line"></div>

        <div class="activity-card">
            <p class="activity-title">${activity.title}</p>
            <p class="activity-time">${timeDisplay}</p>

            <h5 class="activity-files-title">Dateien</h5>

            ${
							files.length === 0
								? `<p class="text-muted">Keine Dateien vorhanden.</p>`
								: files.map(renderFile).join("")
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
