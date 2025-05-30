from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date
from extensions import db
from models import Trip, City  # BudgetCategory якщо треба, але тут не використовується

trips_bp = Blueprint('trips', __name__, url_prefix='/api')
cities_bp = Blueprint('cities', __name__, url_prefix='/api')

@trips_bp.route('/trips', methods=['GET'])
@jwt_required()
def get_trips():
    user_id = get_jwt_identity()
    today = date.today()

    # Автоматично видаляємо закінчені подорожі для користувача
    Trip.query.filter(Trip.user_id == user_id, Trip.end_date < today).delete()
    db.session.commit()

    trips = Trip.query.filter_by(user_id=user_id).order_by(Trip.start_date).all()
    return jsonify([
        {
            'id': t.id,
            'location': t.location,
            'start_date': t.start_date.isoformat(),
            'end_date': t.end_date.isoformat(),
            'notes': t.notes,
            'status': t.status,
            'latitude': t.latitude,
            'longitude': t.longitude,
            'budgets': [{'category': b.category, 'amount': b.amount} for b in getattr(t, 'budgets', [])],
        } for t in trips
    ])

@trips_bp.route('/trips', methods=['POST'])
@jwt_required()
def create_trip():
    data = request.get_json()
    user_id = get_jwt_identity()

    # Валідація
    if 'location' not in data or 'start_date' not in data:
        return jsonify({'error': 'location і start_date потрібні'}), 400

    try:
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d')
    except ValueError:
        return jsonify({'error': 'Неправильний формат start_date'}), 400

    end_date = start_date  # якщо кінцева дата не задана — поставимо її такою ж

    latitude = data.get('latitude', 0.0)
    longitude = data.get('longitude', 0.0)

    trip = Trip(
        user_id=user_id,
        location=data['location'],
        start_date=start_date,
        end_date=end_date,
        notes=data.get('notes'),
        latitude=latitude,
        longitude=longitude
    )
    db.session.add(trip)
    db.session.commit()

    # Повернути створений об’єкт
    return jsonify({
        'id': trip.id,
        'location': trip.location,
        'start_date': trip.start_date.isoformat(),
        'end_date': trip.end_date.isoformat(),
        'notes': trip.notes,
        'latitude': trip.latitude,
        'longitude': trip.longitude,
    }), 201

@trips_bp.route('/trips/<int:trip_id>', methods=['PUT'])
@jwt_required()
def edit_trip(trip_id):
    data = request.get_json()
    trip = Trip.query.get_or_404(trip_id)
    if trip.user_id != get_jwt_identity():
        return jsonify({"message": "Доступ заборонено."}), 403

    trip.location = data.get('location', trip.location)

    # Якщо дати передані, конвертуємо
    if 'start_date' in data:
        try:
            trip.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'Неправильний формат дати start_date'}), 400
    if 'end_date' in data:
        try:
            trip.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'Неправильний формат дати end_date'}), 400

    trip.notes = data.get('notes', trip.notes)
    trip.latitude = data.get('latitude', trip.latitude)
    trip.longitude = data.get('longitude', trip.longitude)

    db.session.commit()
    return jsonify({"message": "Подорож оновлено."}), 200

@cities_bp.route('/cities', methods=['GET'])
def get_cities():
    cities = City.query.all()
    city_list = [{
        'id': c.id,
        'name': c.name,
        'latitude': c.latitude,
        'longitude': c.longitude
    } for c in cities]
    return jsonify(city_list)
