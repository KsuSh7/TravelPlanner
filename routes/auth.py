from flask import Blueprint, request, jsonify
from app import db
from models import User
from flask_jwt_extended import create_access_token

auth_bp = Blueprint('auth', __name__, url_prefix='/api')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    email = data['email']
    password = data['password']

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email вже існує."}), 409

    hashed = password
    user = User(username=username, email=email, password=hashed)
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "Реєстрація успішна."}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if user and user.password == data['password']:
        token = create_access_token(identity=user.id)
        return jsonify({"token": token}), 200
    return jsonify({"message": "Невірний email або пароль."}), 401
