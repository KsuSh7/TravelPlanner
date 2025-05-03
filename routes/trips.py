from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date
from app import db
from models import Trip, BudgetCategory, DailyPlan

trips_bp = Blueprint('trips', __name__, url_prefix='/api')

@trips_bp.route('/trips', methods=['GET'])
@jwt_required()
def get_trips():
    user_id = get_jwt_identity()
    today = date.today()
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
            'budgets': [{'category': b.category, 'amount': b.amount} for b in t.budgets],
            'plans': [{'date': p.date.isoformat(), 'note': p.note, 'planned_budget': p.planned_budget} for p in t.plans]
        } for t in trips
    ])

@trips_bp.route('/trips', methods=['POST'])
@jwt_required()
def create_trip():
    data = request.get_json()
    user_id = get_jwt_identity()
    trip = Trip(
        user_id=user_id,
        location=data['location'],
        start_date=datetime.strptime(data['start_date'], '%Y-%m-%d'),
        end_date=datetime.strptime(data['end_date'], '%Y-%m-%d'),
        notes=data.get('notes')
    )
    db.session.add(trip)
    db.session.commit()
    return jsonify({"message": "Подорож створена."}), 201

@trips_bp.route('/trips/<int:trip_id>', methods=['PUT'])
@jwt_required()
def edit_trip(trip_id):
    data = request.get_json()
    trip = Trip.query.get_or_404(trip_id)
    if trip.user_id != get_jwt_identity():
        return jsonify({"message": "Доступ заборонено."}), 403

    trip.location = data.get('location', trip.location)
    trip.start_date = datetime.strptime(data.get('start_date', trip.start_date.isoformat()), '%Y-%m-%d')
    trip.end_date = datetime.strptime(data.get('end_date', trip.end_date.isoformat()), '%Y-%m-%d')
    trip.notes = data.get('notes', trip.notes)
    db.session.commit()
    return jsonify({"message": "Подорож оновлено."}), 200