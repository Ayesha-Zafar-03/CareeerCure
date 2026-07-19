import os

from slowapi import Limiter
from slowapi.util import get_remote_address

# Disable rate limiting during automated tests.
_enabled = os.getenv("TESTING", "").lower() not in ("1", "true", "yes")

limiter = Limiter(key_func=get_remote_address, default_limits=[], enabled=_enabled)
