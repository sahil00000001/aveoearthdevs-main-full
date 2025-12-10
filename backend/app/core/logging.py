import logging
import sys
from datetime import datetime
from typing import Any, Dict
from pythonjsonlogger import jsonlogger
from app.core.config import settings

class AveoJsonFormatter(jsonlogger.JsonFormatter):
    def add_fields(self, log_record: Dict[str, Any], record: logging.LogRecord, message_dict: Dict[str, Any]) -> None:
        super().add_fields(log_record, record, message_dict)
        log_record['timestamp'] = datetime.utcnow().isoformat()
        log_record['service'] = settings.PROJECT_NAME
        log_record['level'] = record.levelname
        log_record['logger'] = record.name

def setup_logging():
    logger = logging.getLogger("aveo")
    logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper()))
    
    if logger.handlers:
        logger.handlers.clear()
    
    handler = logging.StreamHandler(sys.stdout)
    formatter = AveoJsonFormatter(
        fmt="%(timestamp)s %(level)s %(logger)s %(message)s"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    return logger

logger = setup_logging()

def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(f"aveo.{name}")
