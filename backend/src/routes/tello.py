from flask import Blueprint, g
from flask_socketio import emit

from main import socketio
from models import Tello
from utils.Logger import Logger

TELLO_NAMESPACE = "/tello"

logger = Logger.get_logger()
tello_bp = Blueprint("tello", __name__)


def get_tello():
    """
    Ensures that only one instance of Tello in the application context
    """
    try:
        if 'tello' not in g:
            g.tello = Tello()
        return g.tello
    except Exception:
        logger.error('Failed to initialize Tello instance', exc_info=True)
        raise


@socketio.on("connect", namespace=TELLO_NAMESPACE)
def on_connect():
    """
    When the client connects to the Tello namespace, attempt to connect to the Tello drone
    """
    logger.info("New client connected to Tello namespace")
    try:
        tello = get_tello()
        success = tello.connect()

        status = "success" if success else "error"
        message = f"{'Successfully connected' if success else 'Failed to connect'} to Tello drone"

        tello.takeoff()

        logger.info("Tello drone connected and took off")

        emit("connection_status", {
            "status": status,
            "message": message
        })
    except Exception as e:
        logger.error(f"Connection error:", exc_info=True)
        emit('connection_status', {
            "status": "error",
            "message": f"Unexpected connection error: {str(e)}"
        })


@socketio.on("disconnect", namespace=TELLO_NAMESPACE)
def on_disconnect():
    """
    When the client disconnects, stop the drone and clear resources
    """
    logger.info("Client disconnected from Tello namespace")
    try:

        tello = get_tello()

        tello.stop()
        tello.land()

        logger.info("Tello drone stopped and landed")

        # Clear resources
        if hasattr(g, 'tello'):
            del g.tello
    except Exception:
        logger.error("Error during disconnection: ", exc_info=True)


@socketio.on("move", namespace=TELLO_NAMESPACE)
def move(direction):
    """
    Moves Tello in a given direction.
    Parameters:
        direction (str): direction to move to
    """
    logger.info("Received move event: %s", direction)

    valid_moves = ["up", "down", "left", "right", "forward", "back"]

    if direction not in valid_moves:
        logger.error("Invalid move command: %s", direction)
        return emit('move_status', {
            "status": "error",
            "message": f"Invalid move. Must be one of: {', '.join(valid_moves)}"
        })

    try:
        tello = get_tello()

        moved = tello.move(direction, 20)  # 20 cm movement

        status = "success" if moved else "error"
        message = f"{'Successfully' if moved else 'Failed to'} moved {direction}"

        emit("move_status", {
            "status": status,
            "message": message
        })

    except Exception as e:
        logger.error(f"Move error", exc_info=True)
        emit('move_status', {
            "status": "error",
            "message": f"Unexpected error during movement: {str(e)}"
        })


@socketio.on("rotate", namespace=TELLO_NAMESPACE)
def rotate(direction):
    """
    Rotates Tello in given direction
    """
    logger.info("Received rotate event: %s", direction)

    valid_moves_map = ["cw", "ccw"]

    if direction not in valid_moves_map:
        logger.error("Invalid rotation command: %s", direction)
        return emit("move_status", {
            "status": "error",
            "message": f"Invalid rotation command. Must be one of: {', '.join(valid_moves_map)}"
        })

    try:
        tello = get_tello()

        rotation_actions = {
            "cw": tello.rotate_clockwise,
            "ccw": tello.rotate_counter_clockwise
        }

        # We get a callable from the map and call it with the rotation amount
        rotated = rotation_actions.get(direction)(20)

        status = "success" if rotated else "error"
        message = f"{'Successfully' if rotated else 'Failed to'} rotated {direction}"

        emit("move_status", {
            "status": status,
            "message": message
        })

    except Exception as e:
        logger.error(f"Rotate error: {e}")
        emit('move_status', {
            "status": "error",
            "message": f"Unexpected error during movement: {str(e)}"
        }, namespace=TELLO_NAMESPACE)


@socketio.on("flip", namespace=TELLO_NAMESPACE)
def flip(direction):
    """
    Flips Tello in given direction
    Parameters:
        direction (str): direction to flip in
    """

    logger.info("Received flip event: %s", direction)

    valid_moves = ["left", "right", "forward", "backward"]

    if direction not in valid_moves:
        logger.error("Invalid flip command: %s", direction)
        return emit("move_status", {
            "status": "error",
            "message": f"Invalid flip command. Must be one of: {', '.join(valid_moves)}"
        })

    try:
        tello = get_tello()
        # NOTE: Tello uses the first letter of the direction to interpret which direction to flip to
        flipped = tello.flip(direction[0])

        status = "success" if flipped else "error"
        message = f"{'Successfully' if flipped else 'Failed to'} flip {direction}"

        emit("move_status", {
            "status": status,
            "message": message
        })

    except Exception as e:
        logger.error(f"Flip error: {e}")
        emit('move_status', {
            "status": "error",
            "message": f"Unexpected error during movement: {str(e)}"
        })


@socketio.on("state", namespace=TELLO_NAMESPACE)
def get_state():
    """
    Retrieve and emit Tello drone state
    """
    try:
        logger.info("Retrieving Tello state")

        tello = get_tello()
        state = tello.get_current_state()

        if state:
            logger.info("Tello state retrieved")
            emit('state_update', {
                "status": "success",
                "state": state
            })
        else:
            logger.warning("Could not retrieve Tello state")
            emit('state_update', {
                "status": "error",
                "message": "Could not retrieve Tello state"
            })

    except Exception as e:
        logger.error("State retrieval error", exc_info=True)
        emit('state_update', {
            "status": "error",
            "message": f"Unexpected error retrieving state: {str(e)}"
        })
