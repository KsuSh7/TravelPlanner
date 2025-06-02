import json
from extensions import db
from models import City
from app import app

app.app_context().push()

def import_cities():
    with open('cities.json', 'r', encoding='utf-8') as f:
        cities = json.load(f)

    for city in cities:
        with db.session.no_autoflush:
            exists = City.query.filter_by(id=city['id']).first()
        if exists:
            continue

        new_city = City(
            id=city['id'],
            name=city['name'],
            latitude=float(city['latitude']),
            longitude=float(city['longitude'])
        )
        db.session.add(new_city)

    db.session.commit()
    print(f"Імпортовано {len(cities)} міст.")

if __name__ == "__main__":
    import_cities()
