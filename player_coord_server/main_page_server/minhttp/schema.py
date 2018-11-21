from datetime import datetime
from minhttp import db

class IdPrimaryKeyMixin(object):
    id = db.Column(db.Integer, primary_key=True)


class DateTimeMixin(object):
    created_on = db.Column(db.DateTime, default=datetime.now)
    updated_on = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)


class User(db.Model, IdPrimaryKeyMixin, DateTimeMixin):
    __tablename__ = 'user'
    username = db.Column(db.Text, nullable=False)
    password = db.Column(db.Text, nullable=False)
    game_user_records = db.relationship("GameUserRecord",back_populates="user")

class GameRecord(db.Model, IdPrimaryKeyMixin, DateTimeMixin):
    __tablename__ = 'game_record'
    game_id = db.Column(db.String(256))
    game_user_records = db.relationship("GameUserRecord",back_populates="full_record")

class GameUserRecord(db.Model, IdPrimaryKeyMixin):
    __tablename__ = 'game_user_record'
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    full_record_id = db.Column(db.Integer, db.ForeignKey('game_record.id'))
    win_record = db.Column(db.String(16), nullable=False)
    user = db.relationship("User", back_populates="game_user_records")
    full_record = db.relationship("GameRecord", back_populates="game_user_records")
