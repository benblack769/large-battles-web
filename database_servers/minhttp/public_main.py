from flask import Flask, render_template, request, redirect, make_response

from minhttp import db, app
from minhttp import schema
import json
import re
import sys
from flask_sqlalchemy import SQLAlchemy


@app.after_request
def add_header(response):#
    response.headers['Access-Control-Allow-Origin'] = '*'
    #response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response


def score(user):
    return user['wins'] / (1.0 + user['losses'])

def get_user_record(user):
    win_records = [r.win_record for r in user.game_user_records]
    wins = sum([record == "victory" for record in win_records])
    losses = sum([record == "defeat" for record in win_records])

    return {
        "username": user.username,
        "wins": wins,
        "losses": losses,
    }

@app.route('/rank_users', methods=['GET'])
def get_users_ranks():
    all_users = schema.User.query.all()
    stripped_users = [get_user_record(user) for user in all_users]
    stripped_users.sort(reverse=True,key=score)
    return json.dumps(stripped_users)


@app.route('/register_user', methods=['POST'])
def new_info():
    response_data = json.loads(request.get_data())

    if len(response_data['username']) > 16:
        return json.dumps({
            "type": "registration_error",
            "error_message": "USERNAME_TOO_LONG",
        })

    if not re.match(r'^[A-Za-z0-9_-]+$', response_data['username']) or response_data['username'] == "__server":
        return json.dumps({
            "type": "registration_error",
            "error_message": "USERNAME_NOT_VALID",
        })

    exists_query_result = db.session.query(db.exists().where(schema.User.username==response_data['username'])).scalar()
    if exists_query_result:
        return json.dumps({
            "type": "registration_error",
            "error_message": "USERNAME_TAKEN",
        })

    db_entry = schema.User(
        username=response_data['username'],
        password=response_data['password'],
    )
    print(response_data)
    db.session.add(db_entry)
    db.session.commit()

    return json.dumps({
        "type": "registration_success",
        "username": response_data['username'],
    })

@app.route('/verify_user', methods=['POST'])
def verify_info():
    response_data = json.loads(request.get_data())
    print(response_data)
    exists_query_result = db.session.query(db.exists().where(schema.User.username==response_data['username'] and schema.User.password==response_data['password'])).scalar()
    print(exists_query_result)
    if not exists_query_result:
        return json.dumps({
            "type": "login_error",
            "error_message": "no such username, password combination found.",
        })
    else:
        return json.dumps({
            "type": "login_success",
            "username": response_data['username'],
            "password": response_data['password'],
        })
