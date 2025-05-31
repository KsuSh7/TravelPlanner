from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date
from extensions import db
from models import Trip, City

trips_bp = Blueprint('trips', __name__, url_prefix='/api')
cities_bp = Blueprint('cities', __name__, url_prefix='/api')

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
