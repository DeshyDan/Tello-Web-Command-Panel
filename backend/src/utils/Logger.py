import logging
from logging.handlers import RotatingFileHandler

class Logger:
    """
    Utility class that provides a logger instance for the application
    """
    _loggers = {}

    @classmethod
    def get_logger(cls, name="TelloBackend", log_file="app.log", level=logging.DEBUG):
        if name not in cls._loggers:
            logger = logging.getLogger(name)
            logger.setLevel(level)

            log_format = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")

            console_handler = logging.StreamHandler()
            console_handler.setFormatter(log_format)
            logger.addHandler(console_handler)

            log_file = "logs/" + log_file
            file_handler = RotatingFileHandler(log_file, maxBytes=5 * 1024 * 1024, backupCount=3)
            file_handler.setFormatter(log_format)
            logger.addHandler(file_handler)

            cls._loggers[name] = logger

        return cls._loggers[name]