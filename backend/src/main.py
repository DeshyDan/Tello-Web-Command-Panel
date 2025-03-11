import logging

from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO

from src.utils.Logger import Logger

SUPPORTED_ORIGINS = [
    # Avoid 5000, on Mac, it used by AirTunes/800.74.5
    "http://localhost:5001",
    "http://localhost:5173",
    "*"
]

app = Flask(__name__)

logger = Logger.get_logger("TelloMain")
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
from src.routes.tello import tello_bp

app.register_blueprint(tello_bp)

if __name__ == '__main__':
    try:
        socketio.run(
            app,
            debug=True,
            host='0.0.0.0',
            port=5001,
            log_output=True,
            allow_unsafe_werkzeug=True
        )
    except Exception:
        logger.error('Server startup error', exc_info=True)
