from flask import Blueprint, jsonify
from models import Trip

trips_bp = Blueprint('trips', __name__, url_prefix='/api')

@trips_bp.route('/trips', methods=['GET'])
def get_trips():
    trip1 = Trip(1, "Барселона", 700, "море", "2025-07-01", "2025-07-10")
    return jsonify({
        "id": trip1.id,
        "location": trip1.location,
        "price": trip1.price
    })
