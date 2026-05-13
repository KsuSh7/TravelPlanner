from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import User, City
from extensions import db


profile_bp = Blueprint(
    "profile",
    __name__
)


def split_tags(value):
    if not value:
        return []

    return [
        x.strip()
        for x in value.split(",")
        if x.strip()
    ]


def score_city_for_user(city, user):
    city_tags = set(split_tags(city.tags))
    interests = set(split_tags(user.interests))
    preferred_tags = set(split_tags(user.preferred_tags))

    score = 0
    reasons = []

    matching_interests = interests.intersection(city_tags)
    if matching_interests:
        score += len(matching_interests) * 2
        reasons.append("збігається з інтересами")

    matching_preferences = preferred_tags.intersection(city_tags)
    if matching_preferences:
        score += len(matching_preferences) * 3
        reasons.append("має бажані формати відпочинку")

    travel_type_mapping = {
        "solo": "adventure",
        "couple": "romantic",
        "family": "family",
        "friends": "nightlife",
    }
    expected_tag = travel_type_mapping.get(user.travel_type)
    if expected_tag and expected_tag in city_tags:
        score += 2
        reasons.append("підходить до типу подорожі")

    slow_tags = {"nature", "relax", "culture", "museum"}
    fast_tags = {"nightlife", "food", "architecture", "adventure"}

    if user.pace == "slow" and city_tags.intersection(slow_tags):
        score += 1
        reasons.append("пасує до спокійного темпу")

    if user.pace == "fast" and city_tags.intersection(fast_tags):
        score += 1
        reasons.append("пасує до активного темпу")

    return score, reasons


@profile_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "age": user.age,
        "travel_type": user.travel_type,
        "pace": user.pace,
        "budget": user.budget,
        "interests": split_tags(user.interests),
        "preferred_tags": split_tags(user.preferred_tags),
        "bio": user.bio
    }), 200


@profile_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    data = request.get_json()

    user.age = data.get("age")
    user.travel_type = data.get("travel_type")
    user.pace = data.get("pace")
    user.budget = data.get("budget")
    user.bio = data.get("bio")

    interests = data.get("interests", [])
    preferred_tags = data.get("preferred_tags", [])

    user.interests = ",".join(interests)
    user.preferred_tags = ",".join(preferred_tags)

    db.session.commit()

    return jsonify({
        "message": "Profile updated"
    }), 200


@profile_bp.route("/profile/trip-recommendations", methods=["GET"])
@jwt_required()
def get_trip_recommendations():
    user_id = get_jwt_identity()

    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    cities = City.query.all()
    ranked = []

    for city in cities:
        score, reasons = score_city_for_user(city, user)

        if score <= 0:
            continue

        ranked.append({
            "city_id": city.id,
            "city_name": city.name,
            "tags": split_tags(city.tags),
            "score": score,
            "reason": ", ".join(reasons) if reasons else "може вам підійти",
        })

    ranked.sort(key=lambda item: (-item["score"], item["city_name"]))

    return jsonify(ranked[:5]), 200
