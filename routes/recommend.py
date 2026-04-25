from flask import Blueprint, request, jsonify

from services.user_profiling import classify_user
from services.route_optimizer import build_route
from services.ai_planner import generate_ai_plan
from services.place_loader import get_or_load_places

recommend_bp = Blueprint("recommend", __name__)


@recommend_bp.route("/recommend", methods=["POST"])
def recommend_trip():

    profile = request.json

    city_id = profile.get("city_id")

    if not city_id:
        return jsonify({
            "error": "city_id is required"
        }), 400

    user_type = classify_user(profile)

    places = get_or_load_places(city_id)

    route = build_route(places)

    plan = generate_ai_plan(profile, route)

    return jsonify({
        "user_type": user_type,
        "places": [
            {
                "id": p.id,
                "name": p.name,
                "rating": p.rating,
                "latitude": p.latitude,
                "longitude": p.longitude,
                "tags": p.tags
            }
            for p in places
        ],
        "plan": plan
    })