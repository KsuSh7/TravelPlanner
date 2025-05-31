from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User  # Імпортуй свою модель користувача
from extensions import db  # Якщо ти виніс db у окремий файл
# або просто: from app import db, якщо все в одному файлі

users_bp = Blueprint('users', __name__, url_prefix='/api/users')

@users_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "Користувача не знайдено"}), 404

    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email
    })
