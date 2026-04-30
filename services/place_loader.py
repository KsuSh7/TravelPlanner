import os
import requests
from dotenv import load_dotenv

from models import Place, City
from extensions import db
from services.tag_mapper import normalize_tags


load_dotenv()

API_KEY = os.getenv("GEOAPIFY_API_KEY")


CATEGORIES = [
    "tourism.sights",
    "catering.restaurant",
    "catering.cafe",
    "entertainment",
    "leisure.park",
    "natural"
]


def load_places_for_city(city, force_reload=False):
    if city.places_loaded and not force_reload:
        return len(city.places)

    if force_reload:
        Place.query.filter_by(city_id=city.id).delete()
        db.session.commit()

    added = 0

    for category in CATEGORIES:
        url = "https://api.geoapify.com/v2/places"

        params = {
            "categories": category,
            "filter": f"circle:{city.longitude},{city.latitude},5000",
            "limit": 20,
            "apiKey": API_KEY
        }

        try:
            response = requests.get(
                url,
                params=params,
                timeout=30
            )

            print("CATEGORY:", category)
            print("STATUS:", response.status_code)
            print("URL:", response.url)

            response.raise_for_status()

        except Exception as e:
            print("ERROR:", e)
            continue

        data = response.json()
        print("FEATURES:", len(data.get("features", [])))

        for feature in data.get("features", []):
            props = feature["properties"]
            coords = feature["geometry"]["coordinates"]

            name = props.get("name")
            if not name:
                continue

            exists = Place.query.filter_by(
                city_id=city.id,
                name=name
            ).first()

            if exists:
                continue

            raw_tags = ",".join(
                props.get("categories", [])
            )

            tags = normalize_tags(raw_tags)

            place = Place(
                name=name,
                city_id=city.id,
                latitude=coords[1],
                longitude=coords[0],
                rating=props.get("rating") or 4.0,
                price_level="medium",
                tags=tags
            )

            db.session.add(place)
            added += 1

    city.places_loaded = True
    db.session.commit()

    print(f"{city.name}: added {added}")

    return added


def get_or_load_places(city_id, force_reload=False):
    city = City.query.get(city_id)

    print("CITY:", city)

    if not city:
        return []

    places = Place.query.filter_by(
        city_id=city.id
    ).all()

    print("DB PLACES:", len(places))

    if not places:
        print("LOADING FROM API...")
        added = load_places_for_city(city)
        print("ADDED:", added)

        places = Place.query.filter_by(
            city_id=city.id
        ).all()

        print("NOW IN DB:", len(places))

    return places