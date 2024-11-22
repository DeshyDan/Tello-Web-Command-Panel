from http import HTTPStatus

from flask import Blueprint, jsonify, g

from models import Tello
from .. import socketio

tello_bp = Blueprint("tello", __name__)


def get_tello():
    """
    Ensures only one Tello instance exists by storing it in application context
    """
    if 'tello' not in g:
        g.tello = Tello()
    return g.tello


@socketio.on("connect")
def connect():
    try:
        tello = get_tello()

        tello.connect()
        return jsonify({"message": "Successfully connected"}), HTTPStatus.OK
    except:
        return jsonify({"message": "Could not connect to Tello"}), HTTPStatus.GATEWAY_TIMEOUT


@socketio.on("move")
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


socketio.on("/state")


def get_state():
    tello = get_tello()
    state = tello.get_current_state()

    if state:
        return jsonify({"message": state}), HTTPStatus.OK
    return jsonify({"message": "asdfsdadf"})
