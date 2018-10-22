import os
from minhttp import db
from minhttp import schema

def recreate_db():
    ''' Hackish and bad way of reinniting the database
    by deleting the entire thing and starting over.
    only use for development.'''
    os.system("rm minhttp/user-info.sqlite")
    #deletes all files in folder specified except hidden files and those with no file extension.
    os.system("python init_db.py")

def add_test_data():
    db.session.add(schema.User(
        username="user1",
        password="password",
        wins=6,
        losses=3,
        ties=1,
        disconnected=1
    ))
    db.session.add(schema.User(
        username="user2",
        password="1234",
        wins=8,
        losses=5,
        ties=2,
        disconnected=0
    ))


    db.session.commit()

if __name__ == "__main__":
    recreate_db()
    add_test_data()
