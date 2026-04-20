from flask import Blueprint, request, jsonify
from services.user_profiling import classify_user
from services.recommendation import get_top_places
from services.route_optimizer import build_route
from services.ai_planner import generate_ai_plan

recommend_bp = Blueprint("recommend", __name__)

@recommend_bp.route("/recommend", methods=["POST"])
def recommend_trip():

    profile = request.json

    user_type = classify_user(profile)

    places = get_top_places(profile)

    route = build_route(places)

    plan = generate_ai_plan(profile, route)

    return jsonify({
        "user_type": user_type,
        "places": places,
        "route": route,
        "plan": plan
    })