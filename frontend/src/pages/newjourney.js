import { apiUrl } from "../apiBase";
import "../css/edit-new-journey.css";

export function renderNewJourney({ mount }) {
	mount.innerHTML = `
    <section class="landing">
      <h1>Reise anlegen</h1>
      <p class="text-muted mb-md">Lege zuerst die Reise an, dann füge Tage & Aktivitäten hinzu.</p>

      <form id="newJourneyForm" class="card mb-lg">
        <div class="card-header">Reisedetails</div>

        <div class="form-group">
          <label class="label" for="title">Titel</label>
          <input id="title" name="title" type="text" maxlength="120" required placeholder="Japan 2026" class="input" />
        </div>

        <div class="form-group">
          <label class="label" for="price">Gesamtpreis (optional)</label>
			<input id="price" name="price" type="number" min="0" max="99999.99" step="0.01" class="input" placeholder="z.B 1000 oder 1000.50"/>
        </div>

        <div class="flex gap-md mb-md" style="flex-wrap: wrap;">
          <div class="form-group" style="flex:1; min-width: 220px;">
            <label class="label" for="start_date">Startdatum</label>
            <input id="start_date" name="start_date" type="date" required class="input" />
          </div>

          <div class="form-group" style="flex:1; min-width: 220px;">
            <label class="label" for="end_date">Enddatum</label>
            <input id="end_date" name="end_date" type="date" required class="input" />
          </div>
        </div>

        <div class="form-group">
          <label class="label" for="description">Beschreibung (optional)</label>
          <textarea id="description" name="description" class="textarea" placeholder="Kurzbeschreibung deiner Reise..."></textarea>
        </div>

        <div class="actions">
          <div id="journeyStatus" class="form-status"></div>
          <button type="submit" class="btn btn-primary">Reise speichern</button>
        </div>
      </form>

      <div class="card" id="daysCard" style="display:none;">
        <div class="actions mb-md">
          <div>
            <div class="card-header" style="margin:0;">Tage & Aktivitäten</div>
            <div class="text-muted" id="daysHint">Füge Tage hinzu und plane deinen Ablauf.</div>
          </div>
        </div>


        <div id="daysStatus" class="form-status mb-md"></div>
        <div id="daysList" class="flex flex-column" style="gap: 12px;"></div>
	    <button class="btn btn-accent" id="addDayBtn" type="button">+ Tag</button>
      </div>
    </section>
  `;

	const form = mount.querySelector("#newJourneyForm");
	const journeyStatus = mount.querySelector("#journeyStatus");

	const daysCard = mount.querySelector("#daysCard");
	const addDayBtn = mount.querySelector("#addDayBtn");
	const daysList = mount.querySelector("#daysList");
	const daysStatus = mount.querySelector("#daysStatus");

	const startDateEl = form.querySelector("#start_date");
	const endDateEl = form.querySelector("#end_date");

	let journeyId = null;
	let dayCounter = 0;
	// Merkt alle bereits belegten Tages-Daten dieser Reise (YYYY-MM-DD)
	const usedDayDates = new Set();

	function normalizeDayDate(value) {
		return (value || "").toString().trim();
	}

	function registerUsedDate({ date, dayId }) {
		const d = normalizeDayDate(date);
		if (!d) return;
		if (dayId) {
			usedDayDates.add(`${d}|${Number(dayId)}`);
		} else {
			usedDayDates.add(d);
		}
	}

	function unregisterUsedDate({ date, dayId }) {
		const d = normalizeDayDate(date);
		if (!d) return;
		if (dayId) usedDayDates.delete(`${d}|${Number(dayId)}`);
		usedDayDates.delete(d);
	}

	function setStatus(el, text, type) {
		el.textContent = text || "";
		el.className = `form-status ${type || ""}`;
	}

	function escapeHtml(str) {
		return String(str ?? "")
			.replaceAll("&", "&amp;")
			.replaceAll("<", "&lt;")
			.replaceAll(">", "&gt;")
			.replaceAll('"', "&quot;")
			.replaceAll("'", "&#039;");
	}

	function fmtTime(t) {
		return t ? String(t).slice(0, 5) : "";
	}

	function parseDateInputValueToUtcMidnight(value) {
		// input[type=date] liefert YYYY-MM-DD ohne Zeitzone.
		// Wir parsen explizit als UTC-Mitternacht.
		if (!value || typeof value !== "string") return null;
		const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
		if (!m) return null;
		const year = Number(m[1]);
		const month = Number(m[2]);
		const day = Number(m[3]);
		if (!year || !month || !day) return null;
		return new Date(Date.UTC(year, month - 1, day));
	}

	function computeDayNumber({ journeyStart, dayDate }) {
		const start = parseDateInputValueToUtcMidnight(journeyStart);
		const d = parseDateInputValueToUtcMidnight(dayDate);
		if (!start || !d) return null;

		const diffMs = d.getTime() - start.getTime();
		const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
		return diffDays + 1; // Startdatum = Tag 1
	}

	function ensureJourneySaved() {
		if (!journeyId) {
			setStatus(daysStatus, "Bitte zuerst die Reise speichern.", "error");
			return false;
		}
		return true;
	}

	function dayTemplate({ localId }) {
		return `
      <div class="card" data-day-card="${localId}" style="padding: 14px;">
        <div class="actions mb-md">
          <div class="card-title" data-day-title="${localId}">Tag (noch nicht gespeichert)</div>
          <div class="actions-right">
          <button class="btn btn-secondary btn-sm" type="button" data-edit-day="${localId}">Bearbeiten</button>
          <button class="btn btn-secondary btn-sm" type="button" data-delete-day="${localId}">Löschen</button>
          <button class="btn btn-secondary btn-sm" type="button" data-add-activity="${localId}">+ Aktivität</button>
        </div>
        </div>


        <form data-day-form="${localId}" class="mb-md">
          <div class="flex gap-md" style="flex-wrap: wrap;">
            <div class="form-group" style="flex:1; min-width: 180px;">
              <label class="label">Datum *</label>
              <input name="date" type="date" class="input" required />
            </div>
            <div class="form-group" style="flex:2; min-width: 240px;">
              <label class="label">Titel *</label>
              <input name="title" type="text" class="input" required placeholder="z.B. Anreise & Check-in" />
            </div>
          </div>

          <div class="actions">
            <div class="form-status" data-day-status="${localId}"></div>
            <button class="btn btn-primary" type="submit">Tag speichern</button>
          </div>
        </form>

        <form data-activity-form="${localId}" style="display:none;" class="mb-md">
          <div class="form-group">
            <label class="label">Aktivität *</label>
            <input name="title" type="text" class="input" required placeholder="z.B. Museum besuchen" />
          </div>

          <div class="flex gap-md mb-md" style="flex-wrap: wrap;">
            <div class="form-group" style="flex:1; min-width: 160px;">
              <label class="label">Start</label>
              <input name="start_time" type="time" class="input" required/>
            </div>
            <div class="form-group" style="flex:1; min-width: 160px;">
              <label class="label">Ende (optional)</label>
              <input name="end_time" type="time" class="input" />
            </div>
          </div>

          <div class="actions">
            <div class="form-status" data-activity-status="${localId}"></div>
            <div class="flex gap-md">
              <button class="btn btn-secondary" type="button" data-cancel-activity="${localId}">Abbrechen</button>
              <button class="btn btn-accent" type="submit">Aktivität speichern</button>
            </div>
          </div>
        </form>

        <div data-activities-list="${localId}">
          <p class="text-muted">Noch keine Aktivitäten.</p>
        </div>
      </div>
    `;
	}

	function renderActivities(listEl, activities) {
		const acts = (activities || []).slice().sort((a, b) => {
			const at = a.start_time || "";
			const bt = b.start_time || "";
			if (at < bt) return -1;
			if (at > bt) return 1;
			return (a.title || "").localeCompare(b.title || "");
		});

		if (!acts.length) {
			listEl.innerHTML = `<p class="text-muted">Noch keine Aktivitäten.</p>`;
			return;
		}

		listEl.innerHTML = `
      <div class="flex flex-column">
        ${acts
					.map((a) => {
						const timeText =
							a.start_time || a.end_time
								? `${fmtTime(a.start_time)}${
										a.end_time ? ` Uhr – ${fmtTime(a.end_time)} Uhr` : ""
									}`
								: "ohne Uhrzeit";

						return `
  <div class="card activity-item" data-activity-id="${a.id}">
    <div class="activity-row">
      <div class="activity-main">
        <div class="activity-title">${escapeHtml(a.title)}</div>
        <div class="activity-time">${escapeHtml(timeText)}</div>
      </div>
      <div class="activity-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-edit-activity="${a.id}">Bearbeiten</button>
        <button class="btn btn-secondary btn-sm" type="button" data-delete-activity="${a.id}">Löschen</button>
      </div>
    </div>
  </div>
`;
					})
					.join("")}
      </div>
    `;
	}

	function wireDayCard(dayCardEl) {
		const localId = dayCardEl.getAttribute("data-day-card");

		const dayForm = dayCardEl.querySelector(`[data-day-form="${localId}"]`);
		const dayStatusEl = dayCardEl.querySelector(
			`[data-day-status="${localId}"]`,
		);

		const activityForm = dayCardEl.querySelector(
			`[data-activity-form="${localId}"]`,
		);
		const actStatusEl = dayCardEl.querySelector(
			`[data-activity-status="${localId}"]`,
		);
		const cancelActivityBtn = dayCardEl.querySelector(
			`[data-cancel-activity="${localId}"]`,
		);
		const activitiesListEl = dayCardEl.querySelector(
			`[data-activities-list="${localId}"]`,
		);
		const addActivityBtn = dayCardEl.querySelector(
			`[data-add-activity="${localId}"]`,
		);

		const editDayBtn = dayCardEl.querySelector(`[data-edit-day="${localId}"]`);
		const deleteDayBtn = dayCardEl.querySelector(
			`[data-delete-day="${localId}"]`,
		);
		const dayTitleEl = dayCardEl.querySelector(`[data-day-title="${localId}"]`);

		let savedDayId = null;
		let activities = [];
		let editingActivityId = null;
		let isEditingDay = false;
		let lastSavedDate = null;

		function setActivityDeleteDisabled(activityId, disabled) {
			const btn = activitiesListEl.querySelector(
				`[data-delete-activity="${activityId}"]`,
			);
			if (!btn) return;
			btn.disabled = Boolean(disabled);
			btn.classList.toggle("is-disabled", Boolean(disabled));
			btn.title = disabled
				? "Während dem Bearbeiten kann die Aktivität nicht gelöscht werden. Bitte erst speichern."
				: "";
		}

		function updateDayTitleFromDate() {
			if (!dayTitleEl) return;
			const dayDate = dayForm.querySelector("[name='date']")?.value;
			const start = startDateEl?.value;
			const end = endDateEl?.value;

			const dayNumber = computeDayNumber({ journeyStart: start, dayDate });
			if (dayNumber == null) {
				dayTitleEl.textContent = "Tag";
				return;
			}

			dayTitleEl.textContent = `Tag ${dayNumber}`;

			const endDate = parseDateInputValueToUtcMidnight(end);
			const dayDateUtc = parseDateInputValueToUtcMidnight(dayDate);
			const startUtc = parseDateInputValueToUtcMidnight(start);
			if (
				startUtc &&
				dayDateUtc &&
				(dayDateUtc < startUtc || (endDate && dayDateUtc > endDate))
			) {
				setStatus(
					dayStatusEl,
					`Hinweis: Das Datum liegt außerhalb des Reisezeitraums (${start || "?"}–${end || "?"}).`,
					"error",
				);
			}
		}

		deleteDayBtn.addEventListener("click", async () => {
			// Wenn Tag noch nicht gespeichert: einfach Card entfernen
			if (!savedDayId) {
				if (!confirm("Diesen Tag-Entwurf entfernen?")) return;
				dayCardEl.remove();
				return;
			}

			if (
				!confirm(
					"Tag wirklich löschen? (Alle Aktivitäten dieses Tages werden mitgelöscht)",
				)
			)
				return;

			setStatus(dayStatusEl, "Lösche Tag…", "loading");

			try {
				const res = await fetch(apiUrl(`/v1/days/${savedDayId}`), {
					method: "DELETE",
				});

				if (!res.ok) {
					const data = await res.json().catch(() => ({}));
					setStatus(
						dayStatusEl,
						data?.detail || "Fehler beim Löschen des Tages.",
						"error",
					);
					return;
				}

				// Datum aus Set entfernen
				unregisterUsedDate({ date: lastSavedDate, dayId: savedDayId });
				// UI entfernen
				dayCardEl.remove();
			} catch (err) {
				console.error(err);
				setStatus(
					dayStatusEl,
					"Netzwerkfehler – bitte erneut versuchen.",
					"error",
				);
			}
		});

		editDayBtn.addEventListener("click", () => {
			if (!savedDayId) {
				setStatus(dayStatusEl, "Bitte zuerst den Tag speichern.", "error");
				return;
			}

			isEditingDay = !isEditingDay;

			const inputs = dayForm.querySelectorAll("input");
			inputs.forEach((i) => {
				i.disabled = !isEditingDay;
			});

			const submitBtn = dayForm.querySelector("button[type='submit']");
			submitBtn.disabled = !isEditingDay;
			submitBtn.textContent = isEditingDay
				? "Änderungen speichern"
				: "Tag speichern";

			setStatus(
				dayStatusEl,
				isEditingDay ? "Bearbeitungsmodus aktiv." : "",
				isEditingDay ? "loading" : "",
			);
		});

		function cancelActivityEdit() {
			// Edit-Mode sauber beenden
			if (editingActivityId) {
				setActivityDeleteDisabled(editingActivityId, false);
				editingActivityId = null;
			}
			setStatus(actStatusEl, "", "");
			activityForm.reset();
			activityForm.style.display = "none";
		}

		cancelActivityBtn?.addEventListener("click", () => {
			cancelActivityEdit();
		});

		activitiesListEl.addEventListener("click", async (e) => {
			const delBtn = e.target.closest("[data-delete-activity]");
			const editBtn = e.target.closest("[data-edit-activity]");

			// Löschen
			if (delBtn) {
				const activityId = Number(delBtn.getAttribute("data-delete-activity"));
				if (!activityId) return;

				// Wenn gerade diese Aktivität bearbeitet wird: Löschen verhindern
				if (editingActivityId === activityId) {
					setStatus(
						actStatusEl,
						"Diese Aktivität wird gerade bearbeitet. Bitte erst speichern, dann löschen.",
						"error",
					);
					return;
				}

				if (!confirm("Aktivität wirklich löschen?")) return;

				setStatus(actStatusEl, "Lösche Aktivität…", "loading");

				try {
					const res = await fetch(apiUrl(`/v1/activities/${activityId}/`), {
						method: "DELETE",
					});

					if (!res.ok) {
						const data = await res.json().catch(() => ({}));
						setStatus(
							actStatusEl,
							data?.detail || "Fehler beim Löschen.",
							"error",
						);
						return;
					}

					activities = activities.filter((a) => a.id !== activityId);
					renderActivities(activitiesListEl, activities);
					setStatus(actStatusEl, "Aktivität gelöscht.", "success");
				} catch (err) {
					console.error(err);
					setStatus(
						actStatusEl,
						"Netzwerkfehler – bitte erneut versuchen.",
						"error",
					);
				}
				return;
			}

			// Bearbeiten
			if (editBtn) {
				const activityId = Number(editBtn.getAttribute("data-edit-activity"));
				const act = activities.find((x) => x.id === activityId);
				if (!act) return;

				// Falls bereits eine andere Aktivität im Edit ist, deren Delete wieder aktivieren
				if (editingActivityId && editingActivityId !== activityId) {
					setActivityDeleteDisabled(editingActivityId, false);
				}

				editingActivityId = activityId;
				setActivityDeleteDisabled(activityId, true);
				activityForm.style.display = "block";

				activityForm.querySelector("[name='title']").value = act.title || "";
				activityForm.querySelector("[name='start_time']").value = fmtTime(
					act.start_time,
				);
				activityForm.querySelector("[name='end_time']").value = fmtTime(
					act.end_time,
				);

				setStatus(
					actStatusEl,
					"Bearbeitungsmodus: Änderungen speichern.",
					"loading",
				);
			}
		});

		addActivityBtn.addEventListener("click", () => {
			if (!savedDayId) {
				setStatus(dayStatusEl, "Bitte zuerst den Tag speichern.", "error");
				return;
			}
			activityForm.style.display =
				activityForm.style.display === "none" ? "block" : "none";
			if (activityForm.style.display === "none") {
				cancelActivityEdit();
			}
		});

		dayForm.addEventListener("submit", async (e) => {
			e.preventDefault();
			if (!ensureJourneySaved()) return;

			const fd = new FormData(dayForm);
			const nextDate = normalizeDayDate(fd.get("date"));

			const payloadCreate = {
				journey_id: journeyId,
				title: (fd.get("title") || "").toString(),
				date: nextDate,
			};

			const payloadUpdate = {
				title: (fd.get("title") || "").toString(),
				date: nextDate,
			};

			const isUpdate = Boolean(savedDayId);
			const url = isUpdate
				? apiUrl(`/v1/days/${savedDayId}/`)
				: apiUrl("/v1/days/");

			const method = isUpdate ? "PUT" : "POST";
			const payload = isUpdate ? payloadUpdate : payloadCreate;

			setStatus(
				dayStatusEl,
				isUpdate ? "Aktualisiere Tag…" : "Speichere Tag…",
				"loading",
			);

			try {
				const res = await fetch(url, {
					method,
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				});

				const data = await res.json().catch(() => ({}));

				if (!res.ok) {
					setStatus(
						dayStatusEl,
						data?.detail ||
							(isUpdate
								? "Fehler beim Aktualisieren."
								: "Fehler beim Speichern."),
						"error",
					);
					return;
				}

				// Bei Create: ID merken
				if (!savedDayId) savedDayId = data.id;

				// usedDayDates aktualisieren
				if (lastSavedDate && lastSavedDate !== normalizeDayDate(data?.date)) {
					unregisterUsedDate({ date: lastSavedDate, dayId: savedDayId });
				}
				lastSavedDate = normalizeDayDate(data?.date || nextDate);
				registerUsedDate({ date: lastSavedDate, dayId: savedDayId });

				// Nach Save: wieder sperren
				dayForm.querySelectorAll("input").forEach((i) => {
					i.disabled = true;
				});

				const submitBtn = dayForm.querySelector("button[type='submit']");
				submitBtn.disabled = true;
				submitBtn.textContent = "Tag speichern";

				isEditingDay = false;

				// Tag-Nummer jetzt aus Datum ableiten (Datum ist erst nach Save relevant)
				updateDayTitleFromDate();

				setStatus(
					dayStatusEl,
					isUpdate ? "Tag aktualisiert!" : "Tag gespeichert!",
					"success",
				);

				activityForm.style.display = "none";
				cancelActivityEdit();
			} catch (err) {
				console.error(err);
				setStatus(
					dayStatusEl,
					"Netzwerkfehler – bitte erneut versuchen.",
					"error",
				);
			}
		});

		activityForm.addEventListener("submit", async (e) => {
			e.preventDefault();
			if (!savedDayId) return;

			const fd = new FormData(activityForm);

			const payloadCreate = {
				day_id: savedDayId,
				title: (fd.get("title") || "").toString(),
				start_time: (fd.get("start_time") || "").toString() || null,
				end_time: (fd.get("end_time") || "").toString() || null,
			};

			const payloadUpdate = {
				title: (fd.get("title") || "").toString(),
				start_time: (fd.get("start_time") || "").toString() || null,
				end_time: (fd.get("end_time") || "").toString() || null,
			};

			const isEdit = Boolean(editingActivityId);
			const url = isEdit
				? apiUrl(`/v1/activities/${editingActivityId}/`)
				: apiUrl("/v1/activities/");

			const method = isEdit ? "PUT" : "POST";
			const payload = isEdit ? payloadUpdate : payloadCreate;

			setStatus(
				actStatusEl,
				isEdit ? "Aktualisiere Aktivität…" : "Speichere Aktivität…",
				"loading",
			);

			try {
				const res = await fetch(url, {
					method,
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				});

				const data = await res.json().catch(() => ({}));

				if (!res.ok) {
					setStatus(
						actStatusEl,
						data?.detail ||
							(isEdit
								? "Fehler beim Aktualisieren."
								: "Fehler beim Speichern."),
						"error",
					);
					return;
				}

				if (isEdit) {
					activities = activities.map((a) =>
						a.id === editingActivityId ? data : a,
					);
					// Delete wieder erlauben
					setActivityDeleteDisabled(editingActivityId, false);
					editingActivityId = null;
					setStatus(actStatusEl, "Aktivität aktualisiert!", "success");
				} else {
					activities.push(data);
					setStatus(actStatusEl, "Aktivität gespeichert!", "success");
				}

				renderActivities(activitiesListEl, activities);
				activityForm.reset();
				activityForm.style.display = "none";
				cancelActivityEdit();
			} catch (err) {
				console.error(err);
				setStatus(
					actStatusEl,
					"Netzwerkfehler – bitte erneut versuchen.",
					"error",
				);
			}
		});

		renderActivities(activitiesListEl, activities);
	}

	// Journey erstellen
	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		setStatus(journeyStatus, "Speichere Reise…", "loading");

		const fd = new FormData(form);
		const payload = {
			title: (fd.get("title") || "").toString(),
			price: (fd.get("price") || "").toString() || null,
			start_date: (fd.get("start_date") || "").toString() || null,
			end_date: (fd.get("end_date") || "").toString() || null,
			description: (fd.get("description") || "").toString() || null,
		};

		try {
			const res = await fetch(apiUrl("/v1/journey/create"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			const data = await res.json().catch(() => ({}));

			if (!res.ok) {
				setStatus(
					journeyStatus,
					data?.detail || "Fehler beim Anlegen der Reise.",
					"error",
				);
				return;
			}

			journeyId = data.id;

			setStatus(
				journeyStatus,
				"Reise gespeichert! Jetzt Tage hinzufügen.",
				"success",
			);

			form
				.querySelectorAll("input, textarea, button[type='submit']")
				.forEach((el) => {
					el.disabled = true;
				});

			// Tage-Sektion anzeigen
			daysCard.style.display = "block";
			setStatus(daysStatus, "", "");
		} catch (err) {
			console.error(err);
			setStatus(
				journeyStatus,
				"Netzwerkfehler – bitte erneut versuchen.",
				"error",
			);
		}
	});

	// UI für Tag hinzufügen
	addDayBtn.addEventListener("click", () => {
		if (!ensureJourneySaved()) return;

		dayCounter += 1;
		const localId = String(dayCounter);

		const wrapper = document.createElement("div");
		wrapper.innerHTML = dayTemplate({ localId });
		const dayCardEl = wrapper.firstElementChild;

		daysList.appendChild(dayCardEl);
		wireDayCard(dayCardEl);

		setStatus(daysStatus, "", "");
	});
}
