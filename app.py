from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'Dupl!k64'

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

from models import User, Trip, BudgetCategory, DailyPlan

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)
