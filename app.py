from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from models import db
from routes.auth import auth_bp
from routes.trips import trips_bp
from routes.filters import filters_bp
from flask_jwt_extended import JWTManager

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'Dupl!k64'
jwt = JWTManager(app)

db.init_app(app)

app.register_blueprint(auth_bp)
app.register_blueprint(trips_bp)
app.register_blueprint(filters_bp)

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)
