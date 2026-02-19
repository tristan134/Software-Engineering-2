def test_create_and_get_journey(client):
    payload = {
        "title": "Sommerurlaub",
        "price": 123.45,
        "start_date": "2026-07-01",
        "end_date": "2026-07-10",
        "description": "Testreise",
    }

    r = client.post("/api/v1/journey/create", json=payload)
    assert r.status_code == 201, r.text
    created = r.json()
    assert created["id"] > 0
    assert created["title"] == "Sommerurlaub"

    r2 = client.get(f"/api/v1/journey/{created['id']}")
    assert r2.status_code == 200, r2.text
    got = r2.json()
    assert got["id"] == created["id"]
    assert got["title"] == "Sommerurlaub"


def test_create_journey_title_empty_returns_400(client):
    r = client.post(
        "/api/v1/journey/create",
        json={"title": "   ", "start_date": "2026-01-01", "end_date": "2026-01-02"},
    )
    assert r.status_code == 400


def test_create_day_requires_existing_journey(client):
    r = client.post(
        "/api/v1/days/",
        json={"title": "Tag 1", "journey_id": 999, "date": "2026-07-01"},
    )
    assert r.status_code == 404


def test_create_day_and_activity_flow(client):
    # Journey anlegen
    jr = client.post(
        "/api/v1/journey/create",
        json={
            "title": "Kurztrip",
            "start_date": "2026-07-01",
            "end_date": "2026-07-03",
            "description": "",
        },
    )
    assert jr.status_code == 201, jr.text
    journey_id = jr.json()["id"]

    # Day anlegen
    dr = client.post(
        "/api/v1/days/",
        json={"title": "Tag 1", "journey_id": journey_id, "date": "2026-07-01"},
    )
    assert dr.status_code == 201, dr.text
    day_id = dr.json()["id"]

    # Activities anlegen
    ar = client.post(
        "/api/v1/activities/",
        json={
            "title": "Museum",
            "day_id": day_id,
            "start_time": "10:00:00",
            "end_time": "12:00:00",
        },
    )
    assert ar.status_code == 201, ar.text
    activity_id = ar.json()["id"]

    # list activities
    lr = client.get(f"/api/v1/activities/by-day/{day_id}")
    assert lr.status_code == 200, lr.text
    acts = lr.json()
    assert len(acts) == 1
    assert acts[0]["id"] == activity_id


def test_activity_end_before_start_returns_400(client):
    jr = client.post(
        "/api/v1/journey/create",
        json={"title": "Trip", "start_date": "2026-07-01", "end_date": "2026-07-02"},
    )
    journey_id = jr.json()["id"]
    dr = client.post(
        "/api/v1/days/",
        json={"title": "Tag 1", "journey_id": journey_id, "date": "2026-07-01"},
    )
    day_id = dr.json()["id"]

    ar = client.post(
        "/api/v1/activities/",
        json={
            "title": "Test",
            "day_id": day_id,
            "start_time": "12:00:00",
            "end_time": "10:00:00",
        },
    )
    assert ar.status_code == 400, ar.text
