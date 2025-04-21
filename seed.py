from app import app, db
from models import Trip
from datetime import date

with app.app_context():
    trip1 = Trip(location="Карпати", price=400, type="гори", start_date=date(2025, 7, 1), end_date=date(2025, 7, 5))
    trip2 = Trip(location="Одеса", price=600, type="море", start_date=date(2025, 7, 2), end_date=date(2025, 7, 10))
    trip3 = Trip(location="Львів", price=300, type="історичне місто", start_date=date(2025, 7, 3), end_date=date(2025, 7, 6))

    db.session.add_all([trip1, trip2, trip3])
    db.session.commit()

    print("Дані успішно додано!")
