from minhttp import app

#main.app.config["DEBUG"] = True
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///user-info.sqlite"
