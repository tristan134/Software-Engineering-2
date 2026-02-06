export function renderNewJourney({ mount }) {
  mount.innerHTML = `
    <section class="landing">
      <h1>Reise anlegen</h1>
      <p class="text-muted mb-md">Lege zuerst die Reise an, dann füge Tage & Aktivitäten hinzu.</p>

      <!-- Journey Details -->
      <form id="newJourneyForm" class="card mb-lg">
        <div class="card-header">Reisedetails</div>

        <div class="form-group">
          <label class="label" for="title">Titel</label>
          <input id="title" name="title" type="text" maxlength="120" required placeholder="Japan 2026" class="input" />
        </div>

        <div class="form-group">
          <label class="label" for="price">Gesamtpreis (optional)</label>
          <input id="price" name="price" type="number" min="0" step="1" placeholder="3000" class="input" />
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

        <div class="flex flex-between flex-center mt-md">
          <div id="journeyStatus" class="form-status"></div>
          <button type="submit" class="btn btn-primary">Reise speichern</button>
        </div>
      </form>

      <!-- Days + Activities (initially locked) -->
      <div class="card" id="daysCard" style="max-width: 820px; display:none;">
        <div class="flex flex-between flex-center mb-md">
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

  const daysCard = mount.querySelector("#daysCard");
  const addDayBtn = mount.querySelector("#addDayBtn");
  const daysList = mount.querySelector("#daysList");
  const daysStatus = mount.querySelector("#daysStatus");

  let journeyId = null;
  let dayCounter = 0;

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
        <div class="flex flex-between flex-center mb-md">
          <div style="font-weight:700;">Tag</div>
          <button class="btn btn-secondary" type="button" data-add-activity="${localId}">+ Aktivität</button>
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

          <div class="flex flex-between flex-center">
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

          <div class="flex flex-between flex-center">
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
            const time =
              a.start_time || a.end_time
                ? `<span class="text-muted" style="font-size:.9rem;">${fmtTime(a.start_time)}${a.end_time ? `–${fmtTime(a.end_time)}` : ""}</span>`
                : `<span class="text-muted" style="font-size:.9rem;">ohne Uhrzeit</span>`;
            return `
              <div class="card" style="padding: 12px;">
                <div class="flex flex-between flex-center">
                  <div style="font-weight:700;">${escapeHtml(a.title)}</div>
                  ${time}
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
    const dayStatusEl = dayCardEl.querySelector(`[data-day-status="${localId}"]`);

    const activityForm = dayCardEl.querySelector(`[data-activity-form="${localId}"]`);
    const actStatusEl = dayCardEl.querySelector(`[data-activity-status="${localId}"]`);
    const activitiesListEl = dayCardEl.querySelector(`[data-activities-list="${localId}"]`);
    const addActivityBtn = dayCardEl.querySelector(`[data-add-activity="${localId}"]`);

    let savedDayId = null;
    let activities = [];

    addActivityBtn.addEventListener("click", () => {
      if (!savedDayId) {
        setStatus(dayStatusEl, "Bitte zuerst den Tag speichern.", "error");
        return;
      }
      activityForm.style.display = activityForm.style.display === "none" ? "block" : "none";
    });

    dayForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!ensureJourneySaved()) return;

      setStatus(dayStatusEl, "Speichere Tag…", "loading");

      const fd = new FormData(dayForm);
      const payload = {
        journey_id: journeyId,
        title: (fd.get("title") || "").toString(),
        date: (fd.get("date") || "").toString(),
      };

      try {
        const res = await fetch("http://localhost:8000/api/v1/days", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setStatus(dayStatusEl, data?.detail || "Fehler beim Speichern des Tages.", "error");
          return;
        }

        savedDayId = data.id;
        setStatus(dayStatusEl, "Tag gespeichert!", "success");

        dayForm.querySelectorAll("input").forEach((i) => (i.disabled = true));
        dayForm.querySelector("button[type='submit']").disabled = true;

        // Activity form freischalten
        activityForm.style.display = "none";
      } catch (err) {
        console.error(err);
        setStatus(dayStatusEl, "Netzwerkfehler – bitte erneut versuchen.", "error");
      }
    });

    activityForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!savedDayId) return;

      setStatus(actStatusEl, "Speichere Aktivität…", "loading");

      const fd = new FormData(activityForm);
      const payload = {
        day_id: savedDayId,
        title: (fd.get("title") || "").toString(),
        start_time: (fd.get("start_time") || "").toString() || null,
        end_time: (fd.get("end_time") || "").toString() || null,
      };

      try {
        const res = await fetch("http://localhost:8000/api/v1/activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setStatus(actStatusEl, data?.detail || "Fehler beim Speichern der Aktivität.", "error");
          return;
        }

        activities.push(data);
        renderActivities(activitiesListEl, activities);

        setStatus(actStatusEl, "Aktivität gespeichert!", "success");
        activityForm.reset();
      } catch (err) {
        console.error(err);
        setStatus(actStatusEl, "Netzwerkfehler – bitte erneut versuchen.", "error");
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
      const res = await fetch("http://localhost:8000/api/v1/journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus(journeyStatus, data?.detail || "Fehler beim Anlegen der Reise.", "error");
        return;
      }

      journeyId = data.id;
      let createdJourney = null;
      createdJourney = data;

      setStatus(journeyStatus, "Reise gespeichert! Jetzt Tage hinzufügen.", "success");

      form.querySelectorAll("input, textarea, button[type='submit']").forEach((el) => (el.disabled = true));

      // Tage-Sektion anzeigen
      daysCard.style.display = "block";
      setStatus(daysStatus, "", "");

    } catch (err) {
      console.error(err);
      setStatus(journeyStatus, "Netzwerkfehler – bitte erneut versuchen.", "error");
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
