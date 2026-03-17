def _create_journey(client, **overrides):
    payload = {
        "title": "Meine Reise",
        "price": 10.5,
        "start_date": "2026-07-01",
        "end_date": "2026-07-10",
        "description": "Beschreibung",
    }
    payload.update(overrides)
    r = client.post("/api/v1/journey/create", json=payload)
    assert r.status_code == 201, r.text
    return r.json()


def _create_day(client, journey_id: int, **overrides):
    payload = {"title": "Tag 1", "journey_id": journey_id, "date": "2026-07-01"}
    payload.update(overrides)
    return client.post("/api/v1/days/", json=payload)


def test_create_day_happy_path_strips_title(client):
    journey = _create_journey(client)

    r = _create_day(client, journey["id"], title="  Tag 1  ")
    assert r.status_code == 201, r.text
    created = r.json()

    assert created["journey_id"] == journey["id"]
    assert created["title"] == "Tag 1"
    assert created["date"] == "2026-07-01"


def test_create_day_duplicate_date_in_same_journey_returns_400(client):
    journey = _create_journey(client)

    r1 = _create_day(client, journey["id"], date="2026-07-01")
    assert r1.status_code == 201, r1.text

    r2 = _create_day(client, journey["id"], title="Tag 2", date="2026-07-01")
    assert r2.status_code == 400, r2.text
    assert (
        r2.json().get("detail")
        == "Bitte ein anderes Datum wählen. Dieser Tag ist bereits vorhanden."
    )


def test_create_day_requires_existing_journey_returns_404(client):
    r = _create_day(client, 999999)
    assert r.status_code == 404
    assert r.json().get("detail") == "Reise nicht gefunden"


def test_create_day_title_empty_returns_400(client):
    journey = _create_journey(client)

    r = _create_day(client, journey["id"], title="   ")
    assert r.status_code == 400
    assert r.json().get("detail") == "Titel darf nicht leer sein"


def test_create_day_date_before_journey_start_returns_400(client):
    journey = _create_journey(client, start_date="2026-07-05", end_date="2026-07-10")

    r = _create_day(client, journey["id"], date="2026-07-01")
    assert r.status_code == 400
    assert r.json().get("detail") == "Datum liegt vor dem Startdatum der Reise"


def test_create_day_date_after_journey_end_returns_400(client):
    journey = _create_journey(client, start_date="2026-07-01", end_date="2026-07-03")

    r = _create_day(client, journey["id"], date="2026-07-10")
    assert r.status_code == 400
    assert r.json().get("detail") == "Datum liegt hinter dem Enddatum der Reise"


def test_list_days_for_journey_empty_returns_200_and_empty_list(client):
    journey = _create_journey(client)

    r = client.get(f"/api/v1/days/by-journey/{journey['id']}")
    assert r.status_code == 200, r.text
    assert r.json() == []


def test_list_days_for_journey_unknown_journey_returns_404(client):
    r = client.get("/api/v1/days/by-journey/999999")
    assert r.status_code == 404
    assert r.json().get("detail") == "Reise nicht gefunden"


def test_update_day_happy_path_and_date_validation(client):
    journey = _create_journey(client, start_date="2026-07-01", end_date="2026-07-03")
    created_day = _create_day(
        client, journey["id"], title="Alt", date="2026-07-01"
    ).json()

    # Happy path: title trim
    r1 = client.put(f"/api/v1/days/{created_day['id']}", json={"title": "  Neu  "})
    assert r1.status_code == 200, r1.text
    assert r1.json()["title"] == "Neu"

    # Negativ: title leer
    r2 = client.put(f"/api/v1/days/{created_day['id']}", json={"title": "   "})
    assert r2.status_code == 400
    assert r2.json().get("detail") == "Titel darf nicht leer sein"

    # Negativ: date vor journey.start_date
    r3 = client.put(f"/api/v1/days/{created_day['id']}", json={"date": "2026-06-30"})
    assert r3.status_code == 400
    assert r3.json().get("detail") == "Datum liegt vor dem Startdatum der Reise"

    # Negativ: date nach journey.end_date
    r4 = client.put(f"/api/v1/days/{created_day['id']}", json={"date": "2026-07-10"})
    assert r4.status_code == 400
    assert r4.json().get("detail") == "Datum liegt hinter dem Enddatum der Reise"


def test_update_day_duplicate_date_in_same_journey_returns_400(client):
    journey = _create_journey(client, start_date="2026-07-01", end_date="2026-07-10")

    _create_day(client, journey["id"], title="Tag 1", date="2026-07-01")
    d2 = _create_day(client, journey["id"], title="Tag 2", date="2026-07-02").json()

    # Versuch: zweiten Tag auf Datum des ersten setzen
    r = client.put(f"/api/v1/days/{d2['id']}", json={"date": "2026-07-01"})
    assert r.status_code == 400, r.text
    assert (
        r.json().get("detail")
        == "Bitte ein anderes Datum wählen. Dieser Tag ist bereits vorhanden."
    )

    # Kontrolle: wenn man das eigene Datum erneut setzt, ist es ok
    r_ok = client.put(f"/api/v1/days/{d2['id']}", json={"date": "2026-07-02"})
    assert r_ok.status_code == 200, r_ok.text
    assert r_ok.json()["date"] == "2026-07-02"


def test_update_day_unknown_day_returns_404(client):
    r = client.put("/api/v1/days/999999", json={"title": "Neu"})
    assert r.status_code == 404
    assert r.json().get("detail") == "Tag nicht gefunden"


def test_delete_day_then_list_is_empty(client):
    journey = _create_journey(client)
    created_day = _create_day(client, journey["id"], date="2026-07-01").json()

    d = client.delete(f"/api/v1/days/{created_day['id']}")
    assert d.status_code == 204, d.text

    lr = client.get(f"/api/v1/days/by-journey/{journey['id']}")
    assert lr.status_code == 200, lr.text
    assert lr.json() == []


def test_delete_day_unknown_returns_404(client):
    d = client.delete("/api/v1/days/999999")
    assert d.status_code == 404
    assert d.json().get("detail") == "Tag nicht gefunden"
