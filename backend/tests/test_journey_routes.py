def _create_journey(client, **overrides):
    payload = {
        "title": "Meine Reise",
        "price": 10.5,
        "start_date": "2026-07-01",
        "end_date": "2026-07-10",
        "description": "Beschreibung",
    }
    payload.update(overrides)
    return client.post("/api/v1/journey/create", json=payload)


def test_get_all_journeys_empty_returns_200_and_empty_list(client):
    r = client.get("/api/v1/journey")
    assert r.status_code == 200, r.text
    assert r.json() == []


def test_get_all_journeys_returns_summaries_without_days(client):
    r1 = _create_journey(client, title="A")
    assert r1.status_code == 201, r1.text

    r2 = _create_journey(client, title="B", price=None)
    assert r2.status_code == 201, r2.text

    lr = client.get("/api/v1/journey")
    assert lr.status_code == 200, lr.text
    data = lr.json()
    assert len(data) == 2

    r3 = _create_journey(
        client, title="ALT", start_date="2025-01-01", end_date="2025-01-02"
    )
    assert r3.status_code == 201, r3.text

    lr2 = client.get("/api/v1/journey")
    assert lr2.status_code == 200, lr2.text
    data2 = lr2.json()
    assert len(data2) == 3

    # Neueste Reisedaten zuerst: 2026-07-01 (A/B) vor 2025-01-01 (ALT)
    assert data2[0]["start_date"] >= data2[1]["start_date"]
    assert data2[-1]["title"] == "ALT"

    # response_model=ShowJourneySummarize => keine days im Listing
    for item in data2:
        assert "id" in item
        assert "title" in item
        assert "start_date" in item
        assert "end_date" in item
        assert "description" in item
        assert "days" not in item

    # price serialisiert von Decimal -> float / None
    item_by_title = {i["title"]: i for i in data2}
    assert isinstance(item_by_title["A"]["price"], float)
    assert item_by_title["B"]["price"] is None


def test_get_journey_unknown_id_returns_404(client):
    r = client.get("/api/v1/journey/999999")
    assert r.status_code == 404
    assert r.json().get("detail") == "Reise nicht gefunden"


def test_create_journey_end_date_before_start_date_returns_400(client):
    r = _create_journey(
        client,
        start_date="2026-07-10",
        end_date="2026-07-01",
    )
    assert r.status_code == 400
    assert r.json().get("detail") == "Enddatum darf nicht vor dem Startdatum liegen"


def test_create_journey_missing_title_returns_422(client):
    r = client.post(
        "/api/v1/journey/create",
        json={"start_date": "2026-01-01", "end_date": "2026-01-02"},
    )
    assert r.status_code == 422


def test_create_journey_strips_title_and_defaults_description_to_empty_string(client):
    r = _create_journey(client, title="  Sommerurlaub  ", description=None)
    assert r.status_code == 201, r.text
    created = r.json()

    assert created["title"] == "Sommerurlaub"
    assert created["description"] == ""

    r2 = client.get(f"/api/v1/journey/{created['id']}")
    assert r2.status_code == 200, r2.text
    got = r2.json()

    # response_model=Journey => days existiert und ist initial leer
    assert got["id"] == created["id"]
    assert got["days"] == []


def test_update_journey_unknown_id_returns_404(client):
    r = client.put("/api/v1/journey/999999", json={"title": "X"})
    assert r.status_code == 404
    assert r.json().get("detail") == "Reise nicht gefunden"


def test_update_journey_rejects_whitespace_title_returns_400(client):
    created = _create_journey(client, title="Trip").json()
    r = client.put(f"/api/v1/journey/{created['id']}", json={"title": "   "})
    assert r.status_code == 400
    assert r.json().get("detail") == "Titel darf nicht leer sein"


def test_update_journey_partial_update_and_date_validation(client):
    created = _create_journey(
        client, start_date="2026-07-01", end_date="2026-07-03", title="Trip"
    ).json()

    # partielles Update ok
    r1 = client.put(
        f"/api/v1/journey/{created['id']}",
        json={"price": 99.99, "description": "Neu"},
    )
    assert r1.status_code == 200, r1.text
    updated = r1.json()
    assert updated["price"] in (99.99, "99.99")  # je nach JSON Encoder/Decimal
    assert updated["description"] == "Neu"

    # invalid: start_date nach end_date setzen
    r2 = client.put(
        f"/api/v1/journey/{created['id']}",
        json={"start_date": "2026-08-01"},
    )
    assert r2.status_code == 400
    assert r2.json().get("detail") == "Enddatum darf nicht vor dem Startdatum liegen"


def test_delete_journey_then_get_returns_404(client):
    created = _create_journey(client).json()

    d = client.delete(f"/api/v1/journey/{created['id']}")
    assert d.status_code == 204, d.text

    r2 = client.get(f"/api/v1/journey/{created['id']}")
    assert r2.status_code == 404
    assert r2.json().get("detail") == "Reise nicht gefunden"


def test_delete_journey_unknown_id_returns_404(client):
    d = client.delete("/api/v1/journey/999999")
    assert d.status_code == 404
    assert d.json().get("detail") == "Reise nicht gefunden"
