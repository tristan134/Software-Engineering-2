export function renderEditJourney({ mount }) {
	const API = "http://localhost:8000/api/v1";
	const hash = window.location.hash;
	const journeyId = Number(hash.split("/")[2]);

	if (!journeyId) {
		mount.innerHTML = `<p class="alert alert-error">❌ Keine Reise-ID gefunden.</p>`;
		return;
	}

	mount.innerHTML = `
    <section class="landing">
      <h1>Reise bearbeiten</h1>
      <p class="text-muted mb-md">Bearbeite Reisedetails, Tage & Aktivitäten.</p>

      <form id="editJourneyForm" class="card mb-lg">
        <div class="card-header">Reisedetails</div>

        <div class="form-group">
          <label class="label" for="title">Titel</label>
          <input id="title" name="title" type="text" maxlength="120" required class="input" />
        </div>

        <div class="form-group">
          <label class="label" for="price">Gesamtpreis (optional)</label>
          <input id="price" name="price" type="number" min="0" class="input" />
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
          <textarea id="description" name="description" class="textarea"></textarea>
        </div>

        <div class="actions">
          <div id="journeyStatus" class="form-status"></div>
          <button type="submit" class="btn btn-primary">Änderungen speichern</button>
        </div>
      </form>

      <div class="card" id="daysCard">
        <div class="actions mb-md">
          <div>
            <div class="card-header" style="margin:0;">Tage & Aktivitäten</div>
            <div class="text-muted">Füge Tage hinzu und plane deinen Ablauf.</div>
          </div>
          <button class="btn btn-accent" id="addDayBtn" type="button">+ Tag</button>
        </div>

        <div id="daysStatus" class="form-status mb-md"></div>
        <div id="daysList" class="flex flex-column" style="gap: 12px;"></div>
      </div>
    </section>
  `;

	const form = mount.querySelector("#editJourneyForm");
	const journeyStatus = mount.querySelector("#journeyStatus");

	const addDayBtn = mount.querySelector("#addDayBtn");
	const daysList = mount.querySelector("#daysList");
	const daysStatus = mount.querySelector("#daysStatus");

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

        <form data-day-form="${localId}" class="mb-md">
          <div class="flex gap-md" style="flex-wrap: wrap;">
            <div class="form-group" style="flex:1; min-width: 180px;">
              <label class="label">Datum *</label>
              <input name="date" type="date" class="input" required />
            </div>
            <div class="form-group" style="flex:2; min-width: 240px;">
              <label class="label">Titel *</label>
              <input name="title" type="text" class="input" required />
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
            <input name="title" type="text" class="input" required />
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

	async function loadActivities(dayId) {
		const res = await fetch(`${API}/activities/by-day/${dayId}`);
		if (!res.ok) return [];
		return await res.json().catch(() => []);
	}

	function wireDayCard(dayCardEl, initialDay = null, initialActivities = []) {
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

		let savedDayId = initialDay?.id ?? null;
		let activities = Array.isArray(initialActivities)
			? initialActivities.slice()
			: [];
		let editingActivityId = null;
		let isEditingDay = false;

		// Prefill day
		if (initialDay) {
			dayForm.querySelector("[name='date']").value = initialDay.date || "";
			dayForm.querySelector("[name='title']").value = initialDay.title || "";

			dayForm.querySelectorAll("input").forEach((i) => {
				i.disabled = true;
			});
			dayForm.querySelector("button[type='submit']").disabled = true;
		}

		deleteDayBtn.addEventListener("click", async () => {
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
				const res = await fetch(`${API}/days/${savedDayId}`, {
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
			dayForm.querySelectorAll("input").forEach((i) => {
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

		addActivityBtn.addEventListener("click", () => {
			if (!savedDayId) {
				setStatus(dayStatusEl, "Bitte zuerst den Tag speichern.", "error");
				return;
			}
			activityForm.style.display =
				activityForm.style.display === "none" ? "block" : "none";
		});

		activitiesListEl.addEventListener("click", async (e) => {
			const delBtn = e.target.closest("[data-delete-activity]");
			const editBtn = e.target.closest("[data-edit-activity]");

			if (delBtn) {
				const activityId = Number(delBtn.getAttribute("data-delete-activity"));
				if (!activityId) return;
				if (!confirm("Aktivität wirklich löschen?")) return;

				setStatus(actStatusEl, "Lösche Aktivität…", "loading");
				try {
					const res = await fetch(`${API}/activities/${activityId}`, {
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

		dayForm.addEventListener("submit", async (e) => {
			e.preventDefault();

			const fd = new FormData(dayForm);

			const isUpdate = Boolean(savedDayId);
			const url = isUpdate ? `${API}/days/${savedDayId}` : `${API}/days/`;
			const method = isUpdate ? "PUT" : "POST";

			const payload = isUpdate
				? {
						title: (fd.get("title") || "").toString(),
						date: (fd.get("date") || "").toString(),
					}
				: {
						journey_id: journeyId,
						title: (fd.get("title") || "").toString(),
						date: (fd.get("date") || "").toString(),
					};

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
						data?.detail || "Fehler beim Speichern.",
						"error",
					);
					return;
				}

				if (!savedDayId) {
					savedDayId = data.id;
					// nach Create direkt Activities laden
					activities = await loadActivities(savedDayId);
					renderActivities(activitiesListEl, activities);
				}

				dayForm.querySelectorAll("input").forEach((i) => {
					i.disabled = true;
				});
				const submitBtn = dayForm.querySelector("button[type='submit']");
				submitBtn.disabled = true;
				submitBtn.textContent = "Tag speichern";
				isEditingDay = false;

				setStatus(dayStatusEl, "Tag gespeichert/aktualisiert!", "success");
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

			const isEdit = Boolean(editingActivityId);
			const url = isEdit
				? `${API}/activities/${editingActivityId}`
				: `${API}/activities/`;
			const method = isEdit ? "PUT" : "POST";

			const payload = isEdit
				? {
						title: (fd.get("title") || "").toString(),
						start_time: (fd.get("start_time") || "").toString() || null,
						end_time: (fd.get("end_time") || "").toString() || null,
					}
				: {
						day_id: savedDayId,
						title: (fd.get("title") || "").toString(),
						start_time: (fd.get("start_time") || "").toString() || null,
						end_time: (fd.get("end_time") || "").toString() || null,
					};

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
						data?.detail || "Fehler beim Speichern.",
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

	// Journey speichern => PUT /journey/{id}
	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		setStatus(journeyStatus, "Speichere Änderungen…", "loading");

		const fd = new FormData(form);
		const payload = {
			title: (fd.get("title") || "").toString(),
			price: (fd.get("price") || "").toString() || null,
			start_date: (fd.get("start_date") || "").toString() || null,
			end_date: (fd.get("end_date") || "").toString() || null,
			description: (fd.get("description") || "").toString() || "",
		};

		try {
			const res = await fetch(`${API}/journey/${journeyId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				setStatus(
					journeyStatus,
					data?.detail || "Fehler beim Speichern.",
					"error",
				);
				return;
			}

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

	// + Tag
	addDayBtn.addEventListener("click", () => {
		const index = daysList.children.length + 1;
		const localId = `new-${Date.now()}`;

		const wrapper = document.createElement("div");
		wrapper.innerHTML = dayTemplate({ localId, index });
		const dayCardEl = wrapper.firstElementChild;

		daysList.appendChild(dayCardEl);
		wireDayCard(dayCardEl, null, []);
	});

	// Init: Journey + Days + Activities laden
	(async function init() {
		if (!journeyId) {
			setStatus(journeyStatus, "Fehlende journeyId.", "error");
			return;
		}

		setStatus(journeyStatus, "Lade Reise…", "loading");
		setStatus(daysStatus, "Lade Tage…", "loading");

		try {
			// Journey
			const jRes = await fetch(`${API}/journey/${journeyId}`);
			const journey = await jRes.json().catch(() => ({}));
			if (!jRes.ok) {
				setStatus(
					journeyStatus,
					journey?.detail || "Reise konnte nicht geladen werden.",
					"error",
				);
				setStatus(daysStatus, "", "");
				return;
			}

			form.querySelector("[name='title']").value = journey.title || "";
			form.querySelector("[name='price']").value = journey.price ?? "";
			form.querySelector("[name='start_date']").value =
				journey.start_date || "";
			form.querySelector("[name='end_date']").value = journey.end_date || "";
			form.querySelector("[name='description']").value =
				journey.description || "";

			setStatus(journeyStatus, "", "");

			// Days
			const dRes = await fetch(`${API}/days/by-journey/${journeyId}`);
			const days = await dRes.json().catch(() => []);
			if (!dRes.ok) {
				setStatus(daysStatus, "Tage konnten nicht geladen werden.", "error");
				return;
			}

			daysList.innerHTML = "";

			let idx = 0;
			for (const d of days) {
				idx += 1;
				const localId = `day-${d.id}`;

				const wrapper = document.createElement("div");
				wrapper.innerHTML = dayTemplate({ localId, index: idx });
				const dayCardEl = wrapper.firstElementChild;

				daysList.appendChild(dayCardEl);

				const activities = await loadActivities(d.id);
				wireDayCard(dayCardEl, d, activities);
			}

			setStatus(daysStatus, "", "");
		} catch (err) {
			console.error(err);
			setStatus(
				journeyStatus,
				"Netzwerkfehler – bitte erneut versuchen.",
				"error",
			);
			setStatus(
				daysStatus,
				"Netzwerkfehler – bitte erneut versuchen.",
				"error",
			);
		}
	})();
}
