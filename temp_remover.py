from app import app
from models import Place, City
from extensions import db

with app.app_context():
    Place.query.delete()

    City.query.update({
        City.places_loaded: False
    })

    db.session.commit()

print("Reset done")