from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models import User
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