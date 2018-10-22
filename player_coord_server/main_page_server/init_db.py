from minhttp import db
from minhttp import schema


if __name__ == '__main__':
    db.create_all()
    db.session.commit()
