import logging

from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO

SUPPORTED_ORIGINS = [
    "http://localhost:5001",
    "http://localhost:5173",
    "*"
]

app = Flask(__name__)

logging.basicConfig(level=logging.INFO)
logging.getLogger('werkzeug').setLevel(logging.ERROR)

CORS(app, resources={
    r"/*": {
        "origins": SUPPORTED_ORIGINS,
    }
})

socketio = SocketIO(
    app,
    cors_allowed_origins=SUPPORTED_ORIGINS,
    async_mode='gevent',
    allow_upgrades=True,
    http_compression=True,
    logger=True,
    engineio_logger=True,
    cors_credentials=True
)

# Import routes after initializing app to avoid circular imports
from routes.tello import tello_bp

app.register_blueprint(tello_bp)

# @app.after_request
# def add_cors_headers(response):
#     response.headers['Access-Control-Allow-Origin'] = '*'
#     response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, DELETE'
#     response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
#     response.headers['Access-Control-Allow-Credentials'] = 'true'
#     return response


if __name__ == '__main__':
    try:
        socketio.run(
            app,
            debug=True,
            host='127.0.0.1',
            port=5000,
            log_output=True,
            allow_unsafe_werkzeug=True
        )
    except Exception:
        logging.error('Server startup error', exc_info=True)
