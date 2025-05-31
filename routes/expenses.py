from flask import Blueprint, request, jsonify
from models import db, Expense, Trip
from flask_jwt_extended import jwt_required

expenses_bp = Blueprint('expenses', __name__, url_prefix='/api')

@expenses_bp.route('/trips/<int:trip_id>/expenses', methods=['GET'])
@jwt_required()
def get_expenses(trip_id):
    expenses = Expense.query.filter_by(trip_id=trip_id).all()
    return jsonify([
        {
            'id': e.id,
            'title': e.title,
            'amount': e.amount,
            'date_added': e.date_added.isoformat()
        } for e in expenses
    ])

@expenses_bp.route('/trips/<int:trip_id>/expenses', methods=['POST'])
@jwt_required()
def add_expense(trip_id):
    data = request.get_json()
    title = data.get('title')
    amount = data.get('amount')

    if not title or not isinstance(amount, (int, float)):
        return jsonify({'error': 'Неправильні дані'}), 400

    expense = Expense(trip_id=trip_id, title=title, amount=amount)
    db.session.add(expense)
    db.session.commit()

    return jsonify({
        'id': expense.id,
        'title': expense.title,
        'amount': expense.amount,
        'date_added': expense.date_added.isoformat()
    }), 201
