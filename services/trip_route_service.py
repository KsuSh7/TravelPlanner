from models import TripPlace
from extensions import db


def save_route_to_trip(trip, plan, places):
    place_map = {
        p.name: p
        for p in places
    }

    TripPlace.query.filter_by(
        trip_id=trip.id
    ).delete()

    for i, item in enumerate(plan):
        place = place_map.get(item["place"])

        if not place:
            continue

        trip_place = TripPlace(
            trip_id=trip.id,
            place_id=place.id,
            day=item["day"],
            visit_time=item["time"],
            description=item["description"],
            order_index=i + 1
        )

        db.session.add(trip_place)

    db.session.commit()