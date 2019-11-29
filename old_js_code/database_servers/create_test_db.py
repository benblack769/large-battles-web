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
    user1 = schema.User(
        username="user1",
        password="password",
    )
    user2 = schema.User(
        username="user2",
        password="1234",
    )
    db.session.add(user1)
    db.session.add(user2)
    record1 = schema.GameRecord()
    db.session.add(record1)
    u1r1 = schema.GameUserRecord(
        user=user1,
        full_record=record1,
        win_record="victory",
    )
    u2r1 = schema.GameUserRecord(
        user=user2,
        full_record=record1,
        win_record="defeat",
    )
    db.session.add(u2r1)

    db.session.commit()

    #print([record.win_record for record in u2r1.full_record.game_user_records])


if __name__ == "__main__":
    recreate_db()
    add_test_data()
