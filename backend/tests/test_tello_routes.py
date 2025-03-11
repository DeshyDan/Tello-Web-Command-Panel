from unittest.mock import Mock, patch

import pytest

from src.main import app, socketio
from src.routes.socket.tello import TELLO_NAMESPACE
from src.utils.Logger import Logger
from tests.decorator_utlis import log_test

logger = Logger.get_logger("TestLogger", log_file="test.log")


@pytest.fixture(autouse=True)
def setup_logging():
    logger.info("Starting test")
    yield
    logger.info("Ending test")


@pytest.fixture
def mock_tello():
    """Fixture to create a mock Tello instance"""
    mock = Mock()
    # TODO: Looks like connect is not being mocked correctly, investigate
    mock.connect.return_value = True
    mock.takeoff.return_value = True
    mock.move.return_value = True
    mock.rotate_clockwise.return_value = True
    mock.rotate_counter_clockwise.return_value = True
    mock.flip.return_value = True
    mock.get_current_state.return_value = {
        "battery": 90,
        "flight_time": 60,
        "height": 100
    }
    logger.info(f"Mock Tello instance created: %s", str(mock))
    return mock


@pytest.fixture
def test_client():
    """Create a test client for the Flask app"""
    flask_app = app
    flask_app.config['TESTING'] = True
    return flask_app.test_client()


@pytest.fixture
def socket_client(test_client):
    """Create a Socket.IO test client"""
    return socketio.test_client(app, namespace=TELLO_NAMESPACE)


class TestTelloRoutes:
    @log_test
    def test_disconnect(self, socket_client, mock_tello):
        """Test disconnection handling"""

        with patch('src.routes.tello.get_tello', return_value=mock_tello):
            socket_client.connect(namespace=TELLO_NAMESPACE)
            socket_client.disconnect(namespace=TELLO_NAMESPACE)

            mock_tello.stop.assert_called_once()
            mock_tello.land.assert_called_once()

    @log_test
    def test_move_valid_direction(self, socket_client, mock_tello):
        """Test valid movement commands"""

        with patch('src.routes.tello.get_tello', return_value=mock_tello):
            socket_client.emit('move', 'forward', namespace=TELLO_NAMESPACE)

            received = socket_client.get_received(namespace=TELLO_NAMESPACE)
            logger.info(f"Received: {received}")

            move_response = [r for r in received if r['name'] == 'move_status'][0]

            assert move_response['args'][0]['status'] == 'success'
            assert 'Successfully moved forward' in move_response['args'][0]['message']
            mock_tello.move.assert_called_once_with('forward', 20)

    @log_test
    def test_move_invalid_direction(self, socket_client, mock_tello):
        """Test invalid movement commands"""

        with patch('src.routes.tello.get_tello', return_value=mock_tello):
            socket_client.connect(namespace=TELLO_NAMESPACE)
            socket_client.emit('move', 'invalid_direction', namespace=TELLO_NAMESPACE)

            received = socket_client.get_received(namespace=TELLO_NAMESPACE)
            logger.info(f"Received: {received}")
            move_response = [r for r in received if r['name'] == 'move_status'][0]

            assert move_response['args'][0]['status'] == 'error'
            assert 'Invalid move' in move_response['args'][0]['message']
            mock_tello.move.assert_not_called()

    @log_test
    def test_rotate_valid_direction(self, socket_client, mock_tello):
        """Test valid rotation commands"""

        with patch('src.routes.tello.get_tello', return_value=mock_tello):
            socket_client.connect(namespace=TELLO_NAMESPACE)
            socket_client.emit('rotate', 'cw', namespace=TELLO_NAMESPACE)

            received = socket_client.get_received(namespace=TELLO_NAMESPACE)
            rotate_response = [r for r in received if r['name'] == 'move_status'][0]

            assert rotate_response['args'][0]['status'] == 'success'
            assert 'Successfully rotated cw' in rotate_response['args'][0]['message']
            mock_tello.rotate_clockwise.assert_called_once_with(20)

    @log_test
    def test_rotate_invalid_direction(self, socket_client, mock_tello):
        """Test invalid rotation commands"""
        with patch('src.routes.tello.get_tello', return_value=mock_tello):
            socket_client.connect(namespace=TELLO_NAMESPACE)
            socket_client.emit('rotate', 'invalid', namespace=TELLO_NAMESPACE)

            received = socket_client.get_received(namespace=TELLO_NAMESPACE)
            rotate_response = [r for r in received if r['name'] == 'move_status'][0]

            assert rotate_response['args'][0]['status'] == 'error'
            assert 'Invalid rotation command' in rotate_response['args'][0]['message']
            mock_tello.rotate_clockwise.assert_not_called()
            mock_tello.rotate_counter_clockwise.assert_not_called()

    @log_test
    def test_flip_valid_direction(self, socket_client, mock_tello):
        """Test valid flip commands"""
        with patch('src.routes.tello.get_tello', return_value=mock_tello):
            socket_client.connect(namespace=TELLO_NAMESPACE)
            socket_client.emit('flip', 'left', namespace=TELLO_NAMESPACE)

            received = socket_client.get_received(namespace=TELLO_NAMESPACE)
            flip_response = [r for r in received if r['name'] == 'move_status'][0]

            assert flip_response['args'][0]['status'] == 'success'
            assert 'Successfully flip left' in flip_response['args'][0]['message']
            mock_tello.flip.assert_called_once_with('l')

    @log_test
    def test_flip_invalid_direction(self, socket_client, mock_tello):
        """Test invalid flip commands"""
        with patch('src.routes.tello.get_tello', return_value=mock_tello):
            socket_client.connect(namespace=TELLO_NAMESPACE)
            socket_client.emit('flip', 'invalid', namespace=TELLO_NAMESPACE)

            received = socket_client.get_received(namespace=TELLO_NAMESPACE)
            flip_response = [r for r in received if r['name'] == 'move_status'][0]

            assert flip_response['args'][0]['status'] == 'error'
            assert 'Invalid flip command' in flip_response['args'][0]['message']
            mock_tello.flip.assert_not_called()

    @log_test
    def test_get_state(self, socket_client, mock_tello):
        """Test state retrieval"""
        with patch('src.routes.tello.get_tello', return_value=mock_tello):
            socket_client.connect(namespace=TELLO_NAMESPACE)
            socket_client.emit('state', namespace=TELLO_NAMESPACE)

            received = socket_client.get_received(namespace=TELLO_NAMESPACE)
            state_response = [r for r in received if r['name'] == 'state_update'][0]

            assert state_response['args'][0]['status'] == 'success'
            assert state_response['args'][0]['state'] == {
                'battery': 90,
                'flight_time': 60,
                'height': 100
            }
            mock_tello.get_current_state.assert_called_once()

    @log_test
    def test_get_state_failure(self, socket_client, mock_tello):
        """Test state retrieval failure"""
        mock_tello.get_current_state.return_value = None

        with patch('src.routes.tello.get_tello', return_value=mock_tello):
            socket_client.connect(namespace=TELLO_NAMESPACE)
            socket_client.emit('state', namespace=TELLO_NAMESPACE)

            received = socket_client.get_received(namespace=TELLO_NAMESPACE)
            logger.info(f"Received: {received}")
            state_response = [r for r in received if r['name'] == 'state_update'][0]

            assert state_response['args'][0]['status'] == 'error'
            assert 'Could not retrieve Tello state' in state_response['args'][0]['message']
            mock_tello.get_current_state.assert_called_once()

    # TODO: Find way of testing connection success and failure
    # def test_connect_success(self, socket_client, mock_tello):
    #     """Test successful connection to Tello drone"""
    #     with patch('src.routes.tello.get_tello', return_value=mock_tello):
    #         socket_client.connect(namespace=TELLO_NAMESPACE)
    #         socket_client.emit('connect', namespace=TELLO_NAMESPACE)
    #
    #         received = socket_client.get_received(namespace=TELLO_NAMESPACE)
    #         connection_response = [r for r in received if r['name'] == 'connection_status'][0]
    #
    #         assert connection_response[0]['name'] == 'connection_status'
    #         assert connection_response[0]['args'][0]['status'] == 'success'
    #         assert 'Successfully connected' in connection_response[0]['args'][0]['message']
    #
    #         mock_tello.connect.assert_called_once()
    #         mock_tello.takeoff.assert_called_once()

    # def test_connect_failure(self, socket_client, mock_tello):
    #     """Test failed connection to Tello drone"""
    #     mock_tello.connect.return_value = False
    #
    #     with patch('src.routes.tello.get_tello', return_value=mock_tello):
    #         socket_client.connect(namespace=TELLO_NAMESPACE)
    #         socket_client.emit('connect', namespace=TELLO_NAMESPACE)
    #         socket_client.emit('disconnect', namespace=TELLO_NAMESPACE)
    #
    #         received = socket_client.get_received(namespace=TELLO_NAMESPACE)
    #
    #         assert len(received) == 1
    #         assert received[0]['name'] == 'connection_status'
    #         assert received[0]['args'][0]['status'] == 'error'
    #         assert 'Failed to connect' in received[0]['args'][0]['message']