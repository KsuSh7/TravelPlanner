from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import Trip
from services.user_profiling import classify_user
from services.route_optimizer import build_route
from services.ai_planner import generate_ai_plan
from services.place_loader import get_or_load_places
from services.recommender import get_best_places
from services.trip_route_service import save_route_to_trip


recommend_bp = Blueprint("recommend", __name__)


@recommend_bp.route("/recommend", methods=["POST"])
@jwt_required()
def recommend_trip():
    user_id = get_jwt_identity()
    profile = request.json

    city_id = profile.get("city_id")
    trip_id = profile.get("trip_id")

    print("USER:", user_id)
    print("CITY ID:", city_id)
    print("TRIP ID:", trip_id)

    if not city_id:
        return jsonify({
            "error": "city_id is required"
        }), 400

    trip = None

    if trip_id:
        trip = Trip.query.filter_by(
            id=trip_id,
            user_id=user_id
        ).first()

        if not trip:
            return jsonify({
                "error": "Trip not found"
            }), 404

    user_type = classify_user(profile)

    print("START RECOMMEND")

    places = get_or_load_places(city_id)
    print("PLACES LOADED:", len(places))

    top_places = get_best_places(
        places,
        profile,
        limit=10
    )

    print("TOP PLACES READY")

    route = build_route(top_places)

    print("ROUTE READY")

    plan = generate_ai_plan(
        {
            **profile,
            "user_type": user_type
        },
        route
    )

    print("PLAN READY")

    if trip:
        save_route_to_trip(
            trip=trip,
            plan=plan,
            places=route
        )

    return jsonify({
        "user_type": user_type,
        "places": [
            {
                "id": p.id,
                "name": p.name,
                "latitude": p.latitude,
                "longitude": p.longitude,
                "rating": p.rating,
                "tags": p.tags
            }
            for p in top_places
        ],
        "plan": plan
    }), 200