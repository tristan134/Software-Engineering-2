export function renderNewJourney({ mount }) {
	const API = "http://localhost:8000/api/v1";

	mount.innerHTML = `
    <section class="landing">
      <h1>Reise anlegen</h1>
      <p class="text-muted mb-md">Lege zuerst die Reise an, dann füge Tage & Aktivitäten hinzu.</p>

      <!-- Journey Details -->
      <form id="newJourneyForm" class="card mb-lg">
        <div class="actions" style="align-items: center;">
          <div class="card-header" style="margin:0;">Reisedetails</div>
          <div class="actions-right" style="gap: 8px;">
            <button class="btn btn-secondary btn-sm" id="editJourneyBtn" type="button" style="display:none;">Bearbeiten</button>
            <button class="btn btn-secondary btn-sm" id="deleteJourneyBtn" type="button" style="display:none;">Löschen</button>
          </div>
        </div>

        <div class="form-group">
          <label class="label" for="title">Titel</label>
          <input id="title" name="title" type="text" maxlength="120" required placeholder="Japan 2026" class="input" />
        </div>

        <div class="form-group">
          <label class="label" for="price">Gesamtpreis (optional)</label>
			<input id="price" name="price" type="number" min="0" max="99999.99" step="0.01" class="input" placeholder="z.B 1000€ oder 1000.50€"/>
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
          <button type="submit" class="btn btn-primary" id="saveJourneyBtn">Reise speichern</button>
        </div>
      </form>

      <!-- Days + Activities (initially locked) -->
      <div class="card" id="daysCard" style="display:none;">
        <div class="actions mb-md">
          <div>
            <div class="card-header" style="margin:0;">Tage & Aktivitäten</div>
            <div class="text-muted" id="daysHint">Füge Tage hinzu und plane deinen Ablauf.</div>
          </div>
          <button class="btn btn-accent" id="addDayBtn" type="button">+ Tag</button>
        </div>

        <div id="daysStatus" class="form-status mb-md"></div>
        <div id="daysList" class="flex flex-column" style="gap: 12px;"></div>
      </div>
    </section>
  `;

	const form = mount.querySelector("#newJourneyForm");
	const journeyStatus = mount.querySelector("#journeyStatus");
	const saveJourneyBtn = mount.querySelector("#saveJourneyBtn");
	const editJourneyBtn = mount.querySelector("#editJourneyBtn");
	const deleteJourneyBtn = mount.querySelector("#deleteJourneyBtn");

	const daysCard = mount.querySelector("#daysCard");
	const addDayBtn = mount.querySelector("#addDayBtn");
	const daysList = mount.querySelector("#daysList");
	const daysStatus = mount.querySelector("#daysStatus");

	let journeyId = null;
	let dayCounter = 0;
	let isEditingJourney = true; // vor erstem Speichern ist das Formular editierbar

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

	function setJourneyFormEnabled(enabled) {
		form.querySelectorAll("input, textarea").forEach((el) => {
			el.disabled = !enabled;
		});
		saveJourneyBtn.disabled = !enabled;
	}

	function ensureJourneySaved() {
		if (!journeyId) {
			setStatus(daysStatus, "Bitte zuerst die Reise speichern.", "error");
			return false;
		}
		return true;
	}

	function resetToInitialState() {
		journeyId = null;
		dayCounter = 0;
		isEditingJourney = true;

		form.reset();
		setJourneyFormEnabled(true);
		setStatus(journeyStatus, "", "");
		setStatus(daysStatus, "", "");

		// Buttons/Section zurücksetzen
		editJourneyBtn.style.display = "none";
		deleteJourneyBtn.style.display = "none";
		daysCard.style.display = "none";
		daysList.innerHTML = "";

		saveJourneyBtn.textContent = "Reise speichern";
	}

	// Journey bearbeiten/entsperren (nachdem die Reise angelegt wurde)
	editJourneyBtn?.addEventListener("click", () => {
		if (!journeyId) {
			setStatus(journeyStatus, "Bitte zuerst die Reise speichern.", "error");
			return;
		}

		isEditingJourney = !isEditingJourney;
		setJourneyFormEnabled(isEditingJourney);
		saveJourneyBtn.textContent = isEditingJourney
			? "Änderungen speichern"
			: "Reise speichern";
		editJourneyBtn.textContent = isEditingJourney
			? "Bearbeiten beenden"
			: "Bearbeiten";

		setStatus(
			journeyStatus,
			isEditingJourney
				? "Bearbeitungsmodus aktiv. Änderungen speichern um zu übernehmen."
				: "Bearbeitungsmodus beendet.",
			isEditingJourney ? "loading" : "",
		);
	});

	// Journey löschen (falls man sich vertippt und neu starten will)
	deleteJourneyBtn?.addEventListener("click", async () => {
		if (!journeyId) {
			resetToInitialState();
			return;
		}

		if (
			!confirm(
				"Reise wirklich löschen? Alle bisher angelegten Tage/Aktivitäten gehen verloren.",
			)
		) {
			return;
		}

		setStatus(journeyStatus, "Lösche Reise…", "loading");

		try {
			const res = await fetch(`${API}/journey/${journeyId}`, {
				method: "DELETE",
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				setStatus(
					journeyStatus,
					data?.detail || "Fehler beim Löschen der Reise.",
					"error",
				);
				return;
			}

			resetToInitialState();
			setStatus(journeyStatus, "Reise gelöscht.", "success");
		} catch (err) {
			console.error(err);
			setStatus(
				journeyStatus,
				"Netzwerkfehler – bitte erneut versuchen.",
				"error",
			);
		}
	});

	// Journey erstellen / aktualisieren
	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const fd = new FormData(form);
		const payload = {
			title: (fd.get("title") || "").toString(),
			price: (fd.get("price") || "").toString() || null,
			start_date: (fd.get("start_date") || "").toString() || null,
			end_date: (fd.get("end_date") || "").toString() || null,
			description: (fd.get("description") || "").toString() || null,
		};

		// 1) Noch nicht gespeichert => Create
		if (!journeyId) {
			setStatus(journeyStatus, "Speichere Reise…", "loading");

			try {
				const res = await fetch(`${API}/journey/create`, {
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
				isEditingJourney = false;

				// Formular sperren und Buttons einblenden
				setJourneyFormEnabled(false);
				editJourneyBtn.style.display = "inline-flex";
				deleteJourneyBtn.style.display = "inline-flex";
				saveJourneyBtn.textContent = "Reise speichern";
				editJourneyBtn.textContent = "Bearbeiten";

				setStatus(
					journeyStatus,
					"Reise gespeichert! Du kannst sie über ‚Bearbeiten‘ korrigieren oder löschen.",
					"success",
				);

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
			return;
		}

		// 2) Bereits gespeichert => Update (nur wenn Bearbeiten aktiv)
		if (!isEditingJourney) {
			setStatus(
				journeyStatus,
				"Klicke zuerst auf ‚Bearbeiten‘, um Änderungen vorzunehmen.",
				"error",
			);
			return;
		}

		setStatus(journeyStatus, "Speichere Änderungen…", "loading");

		try {
			const res = await fetch(`${API}/journey/${journeyId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...payload,
					// Backend akzeptiert "" als Beschreibung; wir schicken lieber null -> ""
					description: payload.description ?? "",
				}),
			});

			const data = await res.json().catch(() => ({}));

			if (!res.ok) {
				setStatus(
					journeyStatus,
					data?.detail || "Fehler beim Speichern der Änderungen.",
					"error",
				);
				return;
			}

			// Nach Save wieder sperren
			isEditingJourney = false;
			setJourneyFormEnabled(false);
			saveJourneyBtn.textContent = "Reise speichern";
			editJourneyBtn.textContent = "Bearbeiten";

			setStatus(journeyStatus, "Änderungen gespeichert!", "success");
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
		wrapper.innerHTML = dayTemplate({ localId, index: dayCounter });
		const dayCardEl = wrapper.firstElementChild;

		daysList.appendChild(dayCardEl);
		wireDayCard(dayCardEl);

		setStatus(daysStatus, "", "");
	});

	function dayTemplate({ localId, index }) {
		return `
      <div class="card" data-day-card="${localId}" style="padding: 14px;">
        <div class="actions mb-md">
          <div class="card-title">Tag ${index}</div>
          <div class="actions-right">
          <button class="btn btn-secondary btn-sm" type="button" data-edit-day="${localId}">Bearbeiten</button>
          <button class="btn btn-secondary btn-sm" type="button" data-delete-day="${localId}">Löschen</button>
          <button class="btn btn-secondary" type="button" data-add-activity="${localId}">+ Aktivität</button>
        </div>
        </div>


        <!-- Day create form -->
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

        <!-- Activity create form (hidden until day saved) -->
        <form data-activity-form="${localId}" style="display:none;" class="mb-md">
          <div class="form-group">
            <label class="label">Aktivität *</label>
            <input name="title" type="text" class="input" required placeholder="z.B. Museum besuchen" />
          </div>

          <div class="flex gap-md mb-md" style="flex-wrap: wrap;">
            <div class="form-group" style="flex:1; min-width: 160px;">
              <label class="label">Start (optional)</label>
              <input name="start_time" type="time" class="input" />
            </div>
            <div class="form-group" style="flex:1; min-width: 160px;">
              <label class="label">Ende (optional)</label>
              <input name="end_time" type="time" class="input" />
            </div>
          </div>

          <div class="actions">
            <div class="form-status" data-activity-status="${localId}"></div>
            <button class="btn btn-accent" type="submit">Aktivität speichern</button>
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
      <div class="flex flex-column" style="gap: 10px;">
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
                <div class="activity-title">${escapeHtml(a.title)}</div>
  
                <div class="activity-right">
                  <div class="activity-time">${escapeHtml(timeText)}</div>
                  <button class="btn btn-secondary btn-sm" type="button" data-edit-activity="${
										a.id
									}">Bearbeiten</button>
                  <button class="btn btn-secondary btn-sm" type="button" data-delete-activity="${
										a.id
									}">Löschen</button>
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
				const res = await fetch(
					`http://localhost:8000/api/v1/days/${savedDayId}`,
					{
						method: "DELETE",
					},
				);

				if (!res.ok) {
					const data = await res.json().catch(() => ({}));
					setStatus(
						dayStatusEl,
						data?.detail || "Fehler beim Löschen des Tages.",
						"error",
					);
					return;
				}

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
			submitBtn.disabled = false;
			submitBtn.textContent = isEditingDay
				? "Änderungen speichern"
				: "Tag speichern";

			setStatus(
				dayStatusEl,
				isEditingDay
					? "Bearbeitungsmodus aktiv."
					: "Bearbeitungsmodus beendet.",
				isEditingDay ? "loading" : "",
			);
		});

		activitiesListEl.addEventListener("click", async (e) => {
			const delBtn = e.target.closest("[data-delete-activity]");
			const editBtn = e.target.closest("[data-edit-activity]");

			// Löschen
			if (delBtn) {
				const activityId = Number(delBtn.getAttribute("data-delete-activity"));
				if (!activityId) return;

				if (!confirm("Aktivität wirklich löschen?")) return;

				setStatus(actStatusEl, "Lösche Aktivität…", "loading");

				try {
					const res = await fetch(
						`http://localhost:8000/api/v1/activities/${activityId}/`,
						{
							method: "DELETE",
						},
					);

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

				editingActivityId = activityId;
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
		});

		dayForm.addEventListener("submit", async (e) => {
			e.preventDefault();
			if (!ensureJourneySaved()) return;

			const fd = new FormData(dayForm);
			const payloadCreate = {
				journey_id: journeyId,
				title: (fd.get("title") || "").toString(),
				date: (fd.get("date") || "").toString(),
			};

			const payloadUpdate = {
				title: (fd.get("title") || "").toString(),
				date: (fd.get("date") || "").toString(),
			};

			const isUpdate = Boolean(savedDayId);
			const url = isUpdate
				? `http://localhost:8000/api/v1/days/${savedDayId}/`
				: `http://localhost:8000/api/v1/days/`;

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

				// Nach Save: wieder sperren
				dayForm.querySelectorAll("input").forEach((i) => {
					i.disabled = true;
				});

				const submitBtn = dayForm.querySelector("button[type='submit']");
				submitBtn.disabled = true;
				submitBtn.textContent = "Tag speichern";

				isEditingDay = false;

				// Optional: Titelanzeige hübsch aktualisieren
				if (dayTitleEl) dayTitleEl.textContent = `Tag ${localId}`;

				setStatus(
					dayStatusEl,
					isUpdate ? "Tag aktualisiert!" : "Tag gespeichert!",
					"success",
				);

				// Activity-Form bleibt wie bei dir: erst nach Save sinnvoll
				activityForm.style.display = "none";
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
				? `http://localhost:8000/api/v1/activities/${editingActivityId}/`
				: `http://localhost:8000/api/v1/activities/`;

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
					editingActivityId = null;
					setStatus(actStatusEl, "Aktivität aktualisiert!", "success");
				} else {
					activities.push(data);
					setStatus(actStatusEl, "Aktivität gespeichert!", "success");
				}

				renderActivities(activitiesListEl, activities);
				activityForm.reset();
				activityForm.style.display = "none";
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
			const res = await fetch("http://localhost:8000/api/v1/journey/create", {
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
		wrapper.innerHTML = dayTemplate({ localId, index: dayCounter });
		const dayCardEl = wrapper.firstElementChild;

		daysList.appendChild(dayCardEl);
		wireDayCard(dayCardEl);

		setStatus(daysStatus, "", "");
	});
}
