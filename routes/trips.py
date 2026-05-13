from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date
from extensions import db
from models import Trip, City
from urllib.parse import urlencode
from urllib.request import urlopen
import json

trips_bp = Blueprint('trips', __name__, url_prefix='/api')
cities_bp = Blueprint('cities', __name__, url_prefix='/api')

WEATHER_CODE_LABELS = {
    0: "Ясно",
    1: "Переважно ясно",
    2: "Мінлива хмарність",
    3: "Хмарно",
    45: "Туман",
    48: "Паморозь",
    51: "Легка мряка",
    53: "Мряка",
    55: "Сильна мряка",
    61: "Невеликий дощ",
    63: "Дощ",
    65: "Сильний дощ",
    71: "Невеликий сніг",
    73: "Сніг",
    75: "Сильний сніг",
    80: "Короткочасний дощ",
    81: "Злива",
    82: "Сильна злива",
    95: "Гроза",
}

@trips_bp.route('/trips', methods=['GET'])
@jwt_required()
def get_trips():
    user_id = get_jwt_identity()
    today = date.today()

    Trip.query.filter(Trip.user_id == user_id, Trip.end_date < today).delete()
    db.session.commit()

    trips = Trip.query.filter_by(user_id=user_id).order_by(Trip.start_date).all()

    return jsonify([trip_to_dict(trip) for trip in trips])


def trip_to_dict(trip):
    return {
        'id': trip.id,
        'city_id': trip.city_id,
        'city_name': trip.city.name if trip.city else None,
        'trip_name': trip.trip_name,
        'start_date': trip.start_date.isoformat(),
        'end_date': trip.end_date.isoformat(),
        'latitude': trip.city.latitude if trip.city else None,
        'longitude': trip.city.longitude if trip.city else None,
        'total_budget': trip.total_budget
    }


@trips_bp.route('/trips', methods=['POST'])
@jwt_required()
def create_trip():
    user_id = get_jwt_identity()
    data = request.get_json()

    required_fields = ['city_id', 'start_date', 'end_date', 'total_budget']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()

        if end_date < start_date:
            return jsonify({"error": "End date must be after start date"}), 400

        city = City.query.get(data['city_id'])
        if not city:
            return jsonify({"error": "City not found"}), 404

        trip = Trip(
            user_id=user_id,
            city_id=data['city_id'],
            start_date=start_date,
            trip_name=data['trip_name'],
            end_date=end_date,
            total_budget=float(data['total_budget']),
        )

        db.session.add(trip)
        db.session.commit()

        return jsonify(trip_to_dict(trip)), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@trips_bp.route('/trips/<int:trip_id>/weather', methods=['GET'])
@jwt_required()
def get_trip_weather(trip_id):
    user_id = get_jwt_identity()
    trip = Trip.query.filter_by(id=trip_id, user_id=user_id).first()

    if not trip:
        return jsonify({"error": "Trip not found"}), 404

    if not trip.city or trip.city.latitude is None or trip.city.longitude is None:
        return jsonify({"error": "City coordinates are missing"}), 400

    today = date.today()
    days_until_trip = (trip.start_date - today).days

    if days_until_trip < 0:
        return jsonify({
            "available": False,
            "message": "Подорож уже почалась або завершилась"
        }), 200

    if days_until_trip > 15:
        return jsonify({
            "available": False,
            "message": "Прогноз буде доступний ближче до дати"
        }), 200

    query = urlencode({
        "latitude": trip.city.latitude,
        "longitude": trip.city.longitude,
        "daily": "temperature_2m_max,temperature_2m_min,weather_code",
        "timezone": "auto",
        "forecast_days": 16,
    })
    url = f"https://api.open-meteo.com/v1/forecast?{query}"

    try:
        with urlopen(url, timeout=10) as response:
            payload = json.loads(response.read().decode("utf-8"))

        daily = payload.get("daily", {})
        dates = daily.get("time", [])
        max_temps = daily.get("temperature_2m_max", [])
        min_temps = daily.get("temperature_2m_min", [])
        codes = daily.get("weather_code", [])
        target_date = trip.start_date.isoformat()

        if target_date not in dates:
            return jsonify({
                "available": False,
                "message": "Немає прогнозу на цю дату"
            }), 200

        index = dates.index(target_date)
        weather_code = codes[index] if index < len(codes) else None

        return jsonify({
            "available": True,
            "date": target_date,
            "max_temp": max_temps[index] if index < len(max_temps) else None,
            "min_temp": min_temps[index] if index < len(min_temps) else None,
            "weather_code": weather_code,
            "weather_label": WEATHER_CODE_LABELS.get(weather_code, "Прогноз погоди"),
        }), 200
    except Exception as e:
        return jsonify({
            "available": False,
            "message": "Не вдалося завантажити прогноз",
            "details": str(e)
        }), 502


@cities_bp.route('/cities', methods=['GET'])
def get_cities():
    cities = City.query.all()
    return jsonify([
        {
            'id': c.id,
            'name': c.name,
            'latitude': c.latitude,
            'longitude': c.longitude
        } for c in cities
    ])

@trips_bp.route("/trips/<int:trip_id>/route", methods=["GET"])
def get_trip_route(trip_id):
    trip = Trip.query.get_or_404(trip_id)

    route = []

    for item in sorted(
        trip.route,
        key=lambda x: x.order_index
    ):
        route.append({
            "day": item.day,
            "time": item.visit_time,
            "description": item.description,
            "visited": item.visited,
            "place": {
                "id": item.place.id,
                "name": item.place.name,
                "latitude": item.place.latitude,
                "longitude": item.place.longitude,
                "tags": item.place.tags
            }
        })

    return jsonify(route), 200
