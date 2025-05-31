from flask import Flask
from flask_cors import CORS
from extensions import db, bcrypt
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'Dupl!k64'
app.config['JSON_SORT_KEYS'] = False

CORS(app)
db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)

with app.app_context():
    # Імпортуємо моделі, щоб Flask-Migrate їх побачив
    from models import User, Trip

    # Не викликаємо db.create_all(), бо міграції керують схемою
    # db.create_all()

    # Імпортуємо blueprint-и після ініціалізації app та db
    from routes.auth import auth_bp
    from routes.trips import trips_bp
    from routes.trips import cities_bp
    from routes.users import users_bp
    from routes.expenses import expenses_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(trips_bp)
    app.register_blueprint(cities_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(expenses_bp)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
