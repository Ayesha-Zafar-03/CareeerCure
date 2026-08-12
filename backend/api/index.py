import sys
import traceback

try:
    from app.main import app
except Exception:
    # Surface the exact import error in the HTTP response so it can be read
    # from anywhere instead of being swallowed into unsearchable function logs.
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse

    app = FastAPI()

    @app.get("/{path:path}", include_in_schema=False)
    def import_error_handler(path: str):
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Application import failed",
                "python": sys.version,
                "traceback": traceback.format_exc().splitlines()[-100:],
            },
        )