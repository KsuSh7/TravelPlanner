from flask import Blueprint, request, jsonify
from models import db, Trip

filters_bp = Blueprint('filters', __name__, url_prefix='/api')

@filters_bp.route('/filter', methods=['GET'])
def filter_trips():
    trip_type = request.args.get('type')
    budget = request.args.get('budget', type=float)
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    trips_query = Trip.query

    if trip_type:
        trips_query = trips_query.filter(Trip.type == trip_type)

    if budget:
        trips_query = trips_query.filter(Trip.price <= budget)

    if start_date and end_date:
        trips_query = trips_query.filter(Trip.start_date >= start_date, Trip.end_date <= end_date)

    trips = trips_query.all()

    return jsonify([{
        'location': trip.location,
        'price': trip.price,
        'type': trip.type,
        'start_date': trip.start_date,
        'end_date': trip.end_date
    } for trip in trips])
