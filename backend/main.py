from routes import socketio
from flask import Flask

from routes.tello import tello_bp

app = Flask(__name__)
app.register_blueprint(tello_bp)

if __name__ == '__main__':
    app.debug = True
    socketio.run(app)