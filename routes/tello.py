from html.parser import HTMLParser
from http import HTTPStatus

from flask import Blueprint, jsonify, request, g

from models import Tello

tello_bp = Blueprint("tello", __name__)


def get_tello():
    """
    Ensures only one Tello instance exists by storing it in application context
    """
    if 'tello' not in g:
        g.tello = Tello()
    return g.tello


@tello_bp.post("/connect")
# TODO: Check is connection was already established
def connect():
    try:
        tello = get_tello()

        tello.connect()
        return jsonify({"message": "Successfully connected"}), HTTPStatus.OK
    except:
        return jsonify({"message": "Could not connect to Tello"}), HTTPStatus.GATEWAY_TIMEOUT


@tello_bp.post("/move/<string:direction>")
def move(direction):
    valid_moves = ["up", "down", "left", "right", "forward", "back"]
    if direction not in valid_moves:
        return jsonify({"message": "Not a valid move"}), HTTPStatus.BAD_REQUEST
    tello = get_tello()
    moved = tello.move(direction, 20)
    if moved:
        return jsonify({"message": "Successfully moved"}), HTTPStatus.OK
    else:
        return jsonify({"message": "Did not move"}), HTTPStatus.INTERNAL_SERVER_ERROR


@tello_bp.get("/state")
def get_state():
    tello = get_tello()
    state = tello.get_current_state()

    if state:
        return jsonify({"message": state}), HTTPStatus.OK
    return jsonify({"message": "asdfsdadf"})
