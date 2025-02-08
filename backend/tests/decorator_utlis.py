import functools
import logging

logger = logging.getLogger("TestLogger")

def log_test(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        logger.info(f"Starting test: {func.__name__}")
        result = func(*args, **kwargs)
        logger.info(f"Ending test: {func.__name__}")
        return result
    return wrapper