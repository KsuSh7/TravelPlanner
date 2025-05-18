from flask import Flask
from extensions import db, bcrypt

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'Dupl!k64'

db.init_app(app)
bcrypt.init_app(app)

with app.app_context():
    from models import User, Trip, BudgetCategory, DailyPlan
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)

from flask_cors import CORS

app = Flask(__name__)
CORS(app)
