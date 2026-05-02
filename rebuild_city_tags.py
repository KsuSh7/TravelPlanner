from app import app
from models import City
from services.city_geo_profiler import enrich_city


with app.app_context():

    cities = City.query.filter(
        City.places_loaded == True
    ).all()

    print("Cities:", len(cities))

    for city in cities:
        try:
            tags = enrich_city(city)
            print(city.name, "->", tags)

        except Exception as e:
            print(city.name, "ERROR:", e)