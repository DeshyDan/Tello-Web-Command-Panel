from flask import Blueprint, g
from main import socketio
from models import Tello
import logging

logger = logging.getLogger(__name__)

tello_bp = Blueprint("tello", __name__)

def get_tello():
    """
    Ensures that only one instance of Tello in the application context
    """
    try:
        if 'tello' not in g:
            g.tello = Tello()
        return g.tello
    except Exception as e:
        logger.error(f"Failed to initialize Tello instance: {e}")
        raise

@socketio.on("connect", namespace="/tello")
def on_connect():
    """
    Opens UDP connection with Tello
    """
    logger.info("New client connected to Tello namespace")
    try:
        tello = get_tello()
        success = tello.connect()

        if success:
            tello.takeoff()
            socketio.emit('connection_status', {
                "status": "success",
                "message": "Successfully connected to Tello drone"
            }, namespace="/tello")

        else:
            socketio.emit('connection_status', {
                "status": "error",
                "message": "Failed to connect to Tello drone"
            }, namespace="/tello")

    except Exception as e:
        logger.error(f"Connection error: {e}")
        socketio.emit('connection_status', {
            "status": "error",
            "message": f"Unexpected connection error: {str(e)}"
        }, namespace="/tello")


@socketio.on("disconnect", namespace="/tello")
def on_disconnect():
    logger.info("Client disconnected from Tello namespace")
    try:
        if hasattr(g, 'tello'):
            g.tello.land()
            del g.tello
    except Exception as e:
        logger.error(f"Error during disconnection: {e}")


@socketio.on("move", namespace="/tello")
def move(direction):
    """
    Moves Tello in a given direction.
    Parameters:
        direction (str): direction to move to
    """

    valid_moves = ["up", "down", "left", "right", "forward", "back"]

    ## TODO : Could add more validation
    if direction not in valid_moves:
        return socketio.emit('move_status', {
            "status": "error",
            "message": f"Invalid move. Must be one of: {', '.join(valid_moves)}"
        }, namespace="/tello")

    try:
        tello = get_tello()

        # Added distance parameter and expanded error handling
        moved = tello.move(direction, 20)  # 20 cm movement

        if moved:
            socketio.emit('move_status', {
                "status": "success",
                "message": f"Successfully moved {direction}"
            }, namespace="/tello")
        else:
            socketio.emit('move_status', {
                "status": "error",
                "message": f"Failed to move {direction}"
            }, namespace="/tello")

    except Exception as e:
        logger.error(f"Move error: {e}")
        socketio.emit('move_status', {
            "status": "error",
            "message": f"Unexpected error during movement: {str(e)}"
        }, namespace="/tello")


@socketio.on("state", namespace="/tello")
def get_state():
    """
    Retrieve and emit Tello drone state
    """
    try:
        tello = get_tello()
        state = tello.get_current_state()

        if state:
            socketio.emit('state_update', {
                "status": "success",
                "state": state
            }, namespace="/tello")
        else:
            socketio.emit('state_update', {
                "status": "error",
                "message": "Could not retrieve Tello state"
            }, namespace="/tello")

    except Exception as e:
        logger.error(f"State retrieval error: {e}")
        socketio.emit('state_update', {
            "status": "error",
            "message": f"Unexpected error retrieving state: {str(e)}"
        }, namespace="/tello")
