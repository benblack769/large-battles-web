from datetime import datetime
from minhttp import db

class IdPrimaryKeyMixin(object):
    id = db.Column(db.Integer, primary_key=True)


class DateTimeMixin(object):
    created_on = db.Column(db.DateTime, default=datetime.now)
    updated_on = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)


class User(db.Model, IdPrimaryKeyMixin, DateTimeMixin):
    username = db.Column(db.Text, nullable=False)
    password = db.Column(db.Text, nullable=False)
    wins = db.Column(db.Integer, nullable=False)
    losses = db.Column(db.Integer, nullable=False)
    ties = db.Column(db.Integer, nullable=False)
    disconnected = db.Column(db.Integer, nullable=False)
