from app import app
from models import Place
from extensions import db
from services.tag_mapper import normalize_tags

with app.app_context():

    places = Place.query.all()

    for place in places:
        place.tags = normalize_tags(place.tags)

    db.session.commit()

    print("Done")