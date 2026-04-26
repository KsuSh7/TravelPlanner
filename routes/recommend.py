from flask import Blueprint, request, jsonify

from services.user_profiling import classify_user
from services.route_optimizer import build_route
from services.ai_planner import generate_ai_plan
from services.place_loader import get_or_load_places
from services.recommender import get_best_places

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

    if not places:
        return jsonify({
            "error": "No places found for this city"
        }), 404

    top_places = get_best_places(
        places,
        profile,
        limit=10
    )

    if not top_places:
        return jsonify({
            "error": "No matching places found"
        }), 404

    route = build_route(top_places)

    try:
        plan = generate_ai_plan(profile, route)
    except Exception:
        plan = [
            {
                "day": i // 3 + 1,
                "place": p.name,
                "description": f"Visit {p.name}"
            }
            for i, p in enumerate(route)
        ]

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
    })