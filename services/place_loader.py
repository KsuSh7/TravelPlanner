import os
import requests
from dotenv import load_dotenv

from models import Place, City
from extensions import db

load_dotenv()

API_KEY = os.getenv("GEOAPIFY_API_KEY")


def load_places_for_city(city):
    url = "https://api.geoapify.com/v2/places"

    params = {
        "categories": "tourism.sights",
        "filter": f"circle:{city.longitude},{city.latitude},2500",
        "limit": 20,
        "apiKey": API_KEY
    }

    try:
        response = requests.get(
            url,
            params=params,
            timeout=30
        )
        response.raise_for_status()

    except requests.exceptions.RequestException as e:
        print(f"Error loading {city.name}: {e}")
        db.session.rollback()
        return 0

    data = response.json()
    added = 0

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

        place = Place(
            name=name,
            city_id=city.id,
            latitude=coords[1],
            longitude=coords[0],
            rating=props.get("rating") or 4.0,
            price_level="medium",
            tags=",".join(props.get("categories", []))
        )

        db.session.add(place)
        added += 1

    city.places_loaded = True
    db.session.commit()

    print(f"{city.name}: added {added}")

    return added


def get_or_load_places(city_id):
    city = City.query.get(city_id)

    if not city:
        return []

    if not city.places_loaded:
        load_places_for_city(city)

    return Place.query.filter_by(city_id=city_id).all()