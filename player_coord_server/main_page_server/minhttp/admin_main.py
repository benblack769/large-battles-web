from flask import Flask, render_template, request, redirect, make_response

from minhttp import db, app
from minhttp import schema
import json
import re
import sys
from flask_sqlalchemy import SQLAlchemy

def assert_valid_win_record(record):
    if record != "victory" and record != "defeat" and record != "disconnect":
        raise RuntimeError("record is bad value: "+record)


@app.route('/log_game_result', methods=['POST'])
def log_game_result():
    response_data = json.loads(request.get_data())
    game_id = response_data['game_id']
    results = response_data['results']

    record = schema.GameRecord(
        game_id=str(game_id),
    )
    db.session.add(record)
    for result in results:
        username = result['username']
        winrecord = result['winrecord']
        assert_valid_win_record(winrecord)
        user = db.session.query(schema.User).filter(schema.User.username==username).first()
        user_record = schema.GameUserRecord(
            user=user,
            win_record=winrecord,
            full_record=record
        )
        db.session.add(user_record)

    db.session.commit()
    return json.dumps({
        "type": "SUCCESS"
    })
