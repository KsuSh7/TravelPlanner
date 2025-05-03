from app import app, db
from models import User, Trip
from datetime import date

with app.app_context():
    user = User.query.filter_by(email="test@example.com").first()
    if not user:
        user = User(username="testuser", email="test@example.com", password="123456")
        user.set_password("123456")
        db.session.add(user)
        db.session.commit()

    trip1 = Trip(user_id=user.id, location="Карпати", start_date=date(2025, 7, 1), end_date=date(2025, 7, 5))
    trip2 = Trip(user_id=user.id, location="Одеса", start_date=date(2025, 7, 2), end_date=date(2025, 7, 10))
    trip3 = Trip(user_id=user.id, location="Львів", start_date=date(2025, 7, 3), end_date=date(2025, 7, 6))

    db.session.add_all([trip1, trip2, trip3])
    db.session.commit()

    print("Дані успішно додано!")
