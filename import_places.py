import requests
from app import create_app
from models import City, Place
from extensions import db

API_KEY = "YOUR_API_KEY"

app = create_app()


def load_places():

    cities = City.query.all()
    print("Cities found:", len(cities))

    for city in cities:

        print("Loading places for:", city.name)

        url = "https://api.opentripmap.com/0.1/en/places/radius"

        params = {
            "radius": 5000,
            "lon": city.longitude,
            "lat": city.latitude,
            "apikey": API_KEY
        }

        r = requests.get(url, params=params)

        if r.status_code != 200:
            print("API error:", r.status_code)
            continue

        data = r.json()

        for item in data.get("features", []):

            props = item["properties"]

            name = props.get("name")

            # пропускаємо місця без назви
            if not name:
                continue

            place = Place(
                name=name,
                city_id=city.id,
                rating=props.get("rate"),
                latitude=item["geometry"]["coordinates"][1],
                longitude=item["geometry"]["coordinates"][0],
                tags=props.get("kinds")
            )

            db.session.add(place)

    db.session.commit()
    print("Import finished")


if __name__ == "__main__":

    with app.app_context():
        load_places()