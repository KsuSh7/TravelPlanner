from app import app
from models import City
from services.place_loader import load_places_for_city

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

with app.app_context():

    found = []
    missing = []

    for name in TOP_CITIES:
        city = City.query.filter_by(name=name).first()

        if city:
            found.append(city)
        else:
            missing.append(name)

    print(f"Found {len(found)} cities")
    print("Missing:", missing)

    for city in found:

        if city.places_loaded:
            print(f"Skip {city.name}")
            continue

        print(f"Loading {city.name}")

        try:
            added = load_places_for_city(city)
            print(f"Added {added}")

        except Exception as e:
            print(f"Error {city.name}: {e}")