import os
import requests
from dotenv import load_dotenv
from collections import Counter

from app import app
from models import City, Place
from extensions import db
from services.tag_mapper import normalize_tags

load_dotenv()

API_KEY = os.getenv("GEOAPIFY_API_KEY")

TOP_CITIES = [
    "London", "Paris", "Rome", "Barcelona", "Madrid",
    "Amsterdam", "Berlin", "Munich", "Prague", "Vienna",
    "Budapest", "Athens", "Lisbon", "Porto", "Milan",
    "Venice", "Florence", "Naples", "Dublin", "Edinburgh",
    "Copenhagen", "Stockholm", "Oslo", "Helsinki",
    "Istanbul", "Warsaw", "Krakow", "Brussels", "Zurich", "Kyiv",
    "Tokyo", "Kyoto", "Osaka", "Seoul", "Bangkok",
    "Singapore", "Hong Kong", "Dubai", "Abu Dhabi",
    "Bali", "Delhi", "Mumbai", "Kathmandu",
    "New York City", "Los Angeles", "San Francisco", "Miami",
    "Las Vegas", "Chicago", "Toronto", "Vancouver",
    "Mexico City",
    "Rio de Janeiro", "Sao Paulo", "Buenos Aires",
    "Lima", "Santiago",
    "Cape Town", "Cairo", "Marrakesh", "Nairobi",
    "Sydney", "Melbourne", "Auckland"
]

CATEGORIES = [
    "tourism.sights",
    "catering.restaurant",
    "catering.cafe",
    "entertainment",
    "leisure.park",
    "natural"
]


def load_places_for_city(city):

    print(f"\nLoading {city.name}")

    tag_counter = Counter()
    added_total = 0

    for category in CATEGORIES:

        url = "https://api.geoapify.com/v2/places"

        params = {
            "categories": category,
            "filter": f"circle:{city.longitude},{city.latitude},25000",
            "limit": 25,
            "apiKey": API_KEY
        }

        try:
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()

        except Exception as e:
            print(f"{category}: ERROR {e}")
            continue

        category_added = 0

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

            raw_tags = ",".join(props.get("categories", []))
            tags = normalize_tags(raw_tags)

            # збір тегів міста
            for t in tags.split(","):
                if t:
                    tag_counter[t] += 1

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

            added_total += 1
            category_added += 1

        db.session.commit()
        print(f"{category}: +{category_added}")

    # TOP city tags
    top_tags = [
        tag for tag, _ in tag_counter.most_common(5)
    ]

    city.tags = ",".join(top_tags)
    city.places_loaded = True

    db.session.commit()

    print(f"Total added: {added_total}")
    print(f"City tags: {city.tags}")


with app.app_context():

    found = []
    missing = []

    for name in TOP_CITIES:
        city = City.query.filter_by(name=name).first()

        if city:
            found.append(city)
        else:
            missing.append(name)

    print(f"Found cities: {len(found)}")

    if missing:
        print("Missing cities:")
        for m in missing:
            print("-", m)

    for city in found:

        if city.places_loaded:
            print(f"Skip {city.name}")
            continue

        try:
            load_places_for_city(city)

        except Exception as e:
            print(f"Error {city.name}: {e}")