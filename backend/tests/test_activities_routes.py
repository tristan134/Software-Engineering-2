def _create_journey(client, **overrides):
    payload = {
        "title": "Meine Reise",
        "start_date": "2026-07-01",
        "end_date": "2026-07-10",
        "description": "",
    }
    payload.update(overrides)
    r = client.post("/api/v1/journey/create", json=payload)
    assert r.status_code == 201, r.text
    return r.json()


def _create_day(client, journey_id: int, **overrides):
    payload = {"title": "Tag 1", "journey_id": journey_id, "date": "2026-07-01"}
    payload.update(overrides)
    r = client.post("/api/v1/days/", json=payload)
    assert r.status_code == 201, r.text
    return r.json()


def _create_activity(client, day_id: int, **overrides):
    payload = {
        "title": "Museum",
        "day_id": day_id,
        "start_time": "10:00:00",
        "end_time": "12:00:00",
    }
    payload.update(overrides)
    return client.post("/api/v1/activities/", json=payload)


def test_create_activity_happy_path_strips_title(client):
    journey = _create_journey(client)
    day = _create_day(client, journey["id"], date="2026-07-01")

    r = _create_activity(client, day["id"], title="  Museum  ")
    assert r.status_code == 201, r.text
    created = r.json()

    assert created["day_id"] == day["id"]
    assert created["title"] == "Museum"
    assert created["start_time"] == "10:00:00"
    assert created["end_time"] == "12:00:00"


def test_create_activity_unknown_day_returns_404(client):
    r = _create_activity(client, 999999)
    assert r.status_code == 404
    assert r.json().get("detail") == "Day nicht gefunden"


def test_create_activity_end_before_start_returns_400(client):
    journey = _create_journey(client)
    day = _create_day(client, journey["id"], date="2026-07-01")

    r = _create_activity(
        client,
        day["id"],
        start_time="12:00:00",
        end_time="10:00:00",
    )
    assert r.status_code == 400
    assert r.json().get("detail") == "Enddatum darf nicht vor Startdatum liegen"


def test_create_activity_title_empty_returns_400(client):
    journey = _create_journey(client)
    day = _create_day(client, journey["id"], date="2026-07-01")

    r = _create_activity(client, day["id"], title="   ")
    assert r.status_code == 400
    assert r.json().get("detail") == "Titel darf nicht leer sein"


def test_list_activities_for_day_empty_returns_200_and_empty_list(client):
    journey = _create_journey(client)
    day = _create_day(client, journey["id"], date="2026-07-01")

    r = client.get(f"/api/v1/activities/by-day/{day['id']}")
    assert r.status_code == 200, r.text
    assert r.json() == []


def test_list_activities_for_day_unknown_day_returns_404(client):
    r = client.get("/api/v1/activities/by-day/999999")
    assert r.status_code == 404
    assert r.json().get("detail") == "Day nicht gefunden"


def test_update_activity_happy_path_and_time_validation(client):
    journey = _create_journey(client)
    day = _create_day(client, journey["id"], date="2026-07-01")
    created_act = _create_activity(client, day["id"], title="Alt").json()

    # Happy path: title trim
    r1 = client.put(
        f"/api/v1/activities/{created_act['id']}",
        json={"title": "  Neu  "},
    )
    assert r1.status_code == 200, r1.text
    assert r1.json()["title"] == "Neu"

    # Negativ: title leer
    r2 = client.put(
        f"/api/v1/activities/{created_act['id']}",
        json={"title": "   "},
    )
    assert r2.status_code == 400
    assert r2.json().get("detail") == "Titel darf nicht leer sein"

    # Negativ: end_time < start_time (durch Partial Update)
    r3 = client.put(
        f"/api/v1/activities/{created_act['id']}",
        json={"start_time": "12:00:00", "end_time": "10:00:00"},
    )
    assert r3.status_code == 400
    assert r3.json().get("detail") == "Endzeit darf nicht vor Startzeit liegen"


def test_update_activity_unknown_activity_returns_404(client):
    r = client.put("/api/v1/activities/999999", json={"title": "Neu"})
    assert r.status_code == 404
    assert r.json().get("detail") == "Aktivität nicht gefunden"


def test_delete_activity_then_list_is_empty(client):
    journey = _create_journey(client)
    day = _create_day(client, journey["id"], date="2026-07-01")
    created_act = _create_activity(client, day["id"]).json()

    d = client.delete(f"/api/v1/activities/{created_act['id']}")
    assert d.status_code == 204, d.text

    lr = client.get(f"/api/v1/activities/by-day/{day['id']}")
    assert lr.status_code == 200, lr.text
    assert lr.json() == []


def test_delete_activity_unknown_returns_404(client):
    d = client.delete("/api/v1/activities/999999")
    assert d.status_code == 404
    assert d.json().get("detail") == "Aktivität nicht gefunden"
