from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logging.getLogger('werkzeug').setLevel(logging.ERROR)
app = Flask(__name__)

CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:5001",
            "http://localhost:5173",
            "*"
        ],
        "supports_credentials": True
    }
})

socketio = SocketIO(
    app,
    cors_allowed_origins=[
        "http://localhost:5001",
        "http://localhost:5173",
        "*"
    ],
    async_mode='gevent',
    ping_timeout=15,
    ping_interval=10,
    logger=True,
    engineio_logger=True,
    cors_credentials=True
)

# Import routes after initializing app to avoid circular imports
from routes.tello import tello_bp

app.register_blueprint(tello_bp)


@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, DELETE'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response


if __name__ == '__main__':
    try:
        socketio.run(
            app,
            debug=True,
            host='0.0.0.0',
            port=5001,
            allow_unsafe_werkzeug=True
        )
    except Exception as e:
        logging.error(f"Server startup error: {e}")
