#!/usr/bin/env python

from flask import Flask, render_template, request, redirect, make_response

from minhttp import db, app
from minhttp import schema
import json

@app.route('/add_info')
def add_info():
    return render_template("add_info.html")


@app.route('/')
@app.route('/index.html')
def get_info():
    all_users = schema.User.query.all()

    return render_template('home.html',all_users=all_users)

@app.after_request
def add_header(response):#
    response.headers['Access-Control-Allow-Origin'] = '*'
    #response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

@app.route('/rank_users', methods=['GET'])
def get_users_ranks():
    exists_query_result = db.session.query(db.exists().where(schema.User.username==response_data['username'])).scalar()
    

@app.route('/register_user', methods=['POST'])
def new_info():
    response_data = json.loads(request.get_data())
    exists_query_result = db.session.query(db.exists().where(schema.User.username==response_data['username'])).scalar()
    if exists_query_result:
        return json.dumps({
            "type": "registration_error",
            "error_message": "username already taken, please try again with a different username",
        })

    db_entry = schema.User(
        username=response_data['username'],
        password=response_data['password'],
        wins=0,
        losses=0,
        ties=0,
        disconnected=0
    )
    print(response_data)
    print(db_entry)
    db.session.add(db_entry)
    db.session.commit()

    return json.dumps({
        "type": "registration_success",
        "username": response_data['username'],
    })

@app.route('/verify_user', methods=['POST'])
def verify_info():
    response_data = json.loads(request.get_data())
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
