import logging
from logging.handlers import RotatingFileHandler


class Logger:
    """
    Utility class that provides a logger instance for the application
    """
    _logger = None

    @classmethod
    def get_logger(cls, name="TelloBackend", log_file="app.log", level=logging.DEBUG):
        if cls._logger is None:
            cls._logger = logging.getLogger(name)
            cls._logger.setLevel(level)

            log_format = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")

            console_handler = logging.StreamHandler()
            console_handler.setFormatter(log_format)
            cls._logger.addHandler(console_handler)

            file_handler = RotatingFileHandler(log_file, maxBytes=5 * 1024 * 1024, backupCount=3)
            file_handler.setFormatter(log_format)
            cls._logger.addHandler(file_handler)

        return cls._logger
