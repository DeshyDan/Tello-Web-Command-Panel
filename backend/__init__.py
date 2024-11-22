from flask_socketio import SocketIO
from flask import Flask

from routes import tello_bp

socketio = SocketIO()


def create_app(debug=True):
    app = Flask(__name__)
    app.debug = debug
    app.register_blueprint(tello_bp)
    return app
