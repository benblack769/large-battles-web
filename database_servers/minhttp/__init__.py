from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

import minhttp.config

db = SQLAlchemy(app)
