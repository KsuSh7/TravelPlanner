from flask import Blueprint, request, jsonify
from models import BudgetCategory, db
from extensions import db

budget_bp = Blueprint('budget', __name__, url_prefix='/api')

@budget_bp.route('/expenses', methods=['POST'])
def add_expense():
    data = request.get_json()
    new_expense = BudgetCategory(
        trip_id=data['trip_id'],
        category=data['category'],
        amount=data['amount']
    )
    db.session.add(new_expense)
    db.session.commit()
    return jsonify({'message': 'Expense added successfully'}), 201

@budget_bp.route('/expenses/<int:trip_id>', methods=['GET'])
def get_expenses(trip_id):
    expenses = BudgetCategory.query.filter_by(trip_id=trip_id).all()
    return jsonify([
        {'id': e.id, 'category': e.category, 'amount': e.amount}
        for e in expenses
    ])
