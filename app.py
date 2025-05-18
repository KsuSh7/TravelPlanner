from flask import Flask
from flask_cors import CORS
from extensions import db, bcrypt
from flask_jwt_extended import JWTManager


app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'Dupl!k64'

CORS(app)
db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager()
jwt.init_app(app)


with app.app_context():
    from models import User, Trip, BudgetCategory
    db.create_all()

    # Імпортуємо blueprint-и після ініціалізації app та db
    from routes.auth import auth_bp
    from routes.trips import trips_bp
    from routes.budget import budget_bp  # твій бюджетний blueprint

    app.register_blueprint(auth_bp)
    app.register_blueprint(trips_bp)
    app.register_blueprint(budget_bp)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
