def _create_journey(client, start_date="2026-03-01", end_date="2026-03-05"):
    r = client.post(
        "/api/v1/journey/create",
        json={
            "title": "J",
            "price": None,
            "start_date": start_date,
            "end_date": end_date,
            "description": "",
        },
    )
    assert r.status_code == 201, r.text
    return r.json()


def _create_day(client, journey_id: int, date: str, title: str = "D"):
    r = client.post(
        "/api/v1/days/",
        json={"journey_id": journey_id, "title": title, "date": date},
    )
    assert r.status_code == 201, r.text
    return r.json()


def test_update_journey_shorten_end_date_rejects_days_outside_range(client):
    journey = _create_journey(client, start_date="2026-03-01", end_date="2026-03-05")
    _create_day(client, journey["id"], date="2026-03-05", title="Tag 5")

    # Verkürzen: Enddatum nach vorne -> Day würde außerhalb liegen
    r = client.put(
        f"/api/v1/journey/{journey['id']}",
        json={"end_date": "2026-03-04"},
    )
    assert r.status_code == 400
    assert (
        r.json().get("detail")
        == "Durch das Verschieben liegen mindestens ein Tag außerhalb des neuen Reisezeitraums. Bitte die entsprechenden Tage zuerst löschen."
    )


def test_update_journey_shift_days_rejects_days_outside_range(client):
    journey = _create_journey(client, start_date="2026-03-01", end_date="2026-03-05")
    _create_day(client, journey["id"], date="2026-03-01", title="Tag 1")
    _create_day(client, journey["id"], date="2026-03-02", title="Tag 2")
    _create_day(client, journey["id"], date="2026-03-03", title="Tag 3")

    # Verschieben um +2 Tage -> Tage werden zu 03,04,05.
    # Wenn wir aber gleichzeitig den Zeitraum so verkürzen, dass der 05. nicht mehr reinpasst,
    # muss es ein 400 geben.
    r = client.put(
        f"/api/v1/journey/{journey['id']}?shift_days=true",
        json={"start_date": "2026-03-03", "end_date": "2026-03-04"},
    )
    assert r.status_code == 400
    assert (
        r.json().get("detail")
        == "Durch das Verschieben liegen mindestens ein Tag außerhalb des neuen Reisezeitraums. Bitte die entsprechenden Tage zuerst löschen."
    )
