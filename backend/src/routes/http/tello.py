from flask import Blueprint, g, jsonify, request

from src.models import Tello
from src.utils.Logger import Logger

tello_bp = Blueprint("tello"
                     , __name__,
                     url_prefix="/tello")
logger = Logger.get_logger(name="TelloHttpRoutes")


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


@tello_bp.route("/connect", methods=["POST"])
def connect():
    logger.info("Client is connecting to Tello")
    try:
        tello = get_tello()
        success = tello.connect()

        if success:
            logger.info("Tello drone connected")
            return response_generator("Successfully connected to Tello drone", 200)
        else:
            logger.info("Failed to connect to Tello drone")
            return response_generator("Failed to connect to Tello drone", 500)
    except Exception as e:
        logger.error("Connection error:", exc_info=True)
        response = response_generator(f"Unexpected connection error: {str(e)}", 500)

        return response


@tello_bp.route("/disconnect", methods=["POST"])
def disconnect():
    logger.info("Client is disconnecting from Tello")
    try:

        tello = get_tello()

        tello.stop()
        tello.land()

        logger.info("Tello drone stopped and landed")
        # Clear resources
        if hasattr(g, 'tello'):
            del g.tello
        return response_generator("Successfully disconnected from Tello drone", 200)


    except Exception as e:
        logger.error("Error during disconnection: ", exc_info=True)
        return response_generator(f"Error during disconnection: {str(e)}", 500)


@tello_bp.route("/takeoff", methods=["POST"])
def takeoff():
    logger.info("Client is taking off Tello")
    try:
        tello = get_tello()
        tello.takeoff()
        return response_generator("Successfully took off Tello drone", 200)
    except Exception as e:
        logger.error(f"Takeoff error:", exc_info=True)
        return response_generator(f"Unexpected takeoff error: {str(e)}", 500)


@tello_bp.route("/land", methods=["POST"])
def land():
    logger.info("Client is landing Tello")
    try:
        tello = get_tello()
        tello.land()
        return response_generator("Successfully landed Tello drone", 200)
    except Exception as e:
        logger.error(f"Landing error:", exc_info=True)
        return response_generator(f"Unexpected landing error: {str(e)}", 500)


@tello_bp.route("/move", methods=["POST"])
def move():
    logger.info("Client is moving Tello")
    direction = request.json.get("direction")
    distance = request.json.get("distance", 20)

    valid_moves = ["up", "down", "left", "right", "forward", "back"]

    if direction not in valid_moves:
        return response_generator(f"Invalid direction: {direction}", 400)

    try:
        tello = get_tello()

        tello.move(direction, distance)

        return response_generator(f"Successfully moved {direction}", 200)
    except Exception as e:
        logger.error(f"Move error:", exc_info=True)
        return response_generator(f"Unexpected move error: {str(e)}", 500)


@tello_bp.route("/rotate", methods=["POST"])
def rotate():
    logger.info("Client is rotating Tello")

    direction = request.json.get("direction")
    angle = request.json.get("angle", 90)

    valid_rotations = ["cw", "ccw"]

    if direction not in valid_rotations:
        return response_generator(f"Invalid rotation: {direction}", 400)

    try:
        tello = get_tello()

        rotation_actions = {
            "cw": tello.rotate_clockwise,
            "ccw": tello.rotate_counter_clockwise
        }

        # We get a callable from the map and call it with the rotation amount
        rotation_actions.get(direction)(angle)

        return response_generator(f"Successfully rotated {direction}", 200)
    except Exception as e:
        logger.error("Rotation error:", exc_info=True)
        return response_generator(f"Unexpected rotation error: {str(e)}", 500)


@tello_bp.route("/flip", methods=["POST"])
def flip():
    logger.info("Client is flipping Tello")
    direction = request.json.get("direction")

    valid_moves = ["left", "right", "forward", "backward"]

    if direction not in valid_moves:
        return response_generator(f"Invalid flip direction: {direction}", 400)

    try:
        tello = get_tello()
        # NOTE: Tello uses the first letter of the direction to interpret which direction to flip to
        tello.flip(direction[0])

        return response_generator("Successfully flipped Tello", 200)
    except Exception as e:
        logger.error("Flip error:", exc_info=True)
        return response_generator(f"Unexpected flip error: {str(e)}", 500)


@tello_bp.route("/state", methods=["GET"])
def state():
    logger.info("Client is getting Tello state")
    try:
        tello = get_tello()
        state = tello.get_current_state()

        if not state:
            logger.error("Failed to get Tello state")
            return response_generator("Failed to get Tello state", 500)

        logger.info("Successfully got Tello state")
        return response_generator(state, 200)
    except Exception as e:
        logger.error("State error:", exc_info=True)
        return response_generator(f"Unexpected state error: {str(e)}", 500)


def response_generator(message, code):
    return jsonify({
        "message": message
    }), code
