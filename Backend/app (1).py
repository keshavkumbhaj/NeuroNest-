"""
app.py
------
This is the entry point of the NeuroNest backend.

Running `python app.py` will:
1. Create the Flask app
2. Load configuration (database path, AI model path, etc.)
3. Enable CORS so the frontend (running on a different port) can call this API
4. Initialize the SQLite database (creates tables if they don't exist yet)
5. Load the on-device AI model (GGUF) into memory ONCE at startup
6. Register all API routes
7. Serve the frontend files and start the server
"""

import sys

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

from config import Config
from database import db, init_db
from routes import routes_bp
import ai_engine


def create_app():
    """
    Application factory.
    Building the app inside a function (instead of at the top of the file)
    keeps things clean and avoids circular imports between app.py, routes.py,
    and database.py.
    """

    # Tell Flask where the frontend files live, so it can serve
    # index.html, styles.css, and script.js directly.
    app = Flask(
        __name__,
        static_folder="../frontend",
        static_url_path=""
    )

    # ---- 1. Load configuration ----
    # All settings (database URI, model path, secret key) live in config.py
    app.config.from_object(Config)

    # ---- 2. Enable CORS (API routes only) ----
    # This allows the frontend (e.g. served on localhost:5500) to make
    # fetch() requests to this Flask server (e.g. running on localhost:5000)
    # without the browser blocking the request.
    # We restrict this to /api/* so routes like "/" and "/health" are not
    # affected by CORS rules they don't need.
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # ---- 3. Initialize the database ----
    # This connects SQLAlchemy to the app and creates the SQLite tables
    # (habits, daily_completions, reflections) if they don't already exist.
    db.init_app(app)
    with app.app_context():
        init_db()

    # ---- 4. Load the AI model (on-device, offline) ----
    # We load the GGUF model ONCE here at startup, not on every request.
    # This keeps each "Generate Advice" click fast, at the cost of a few
    # extra seconds when the server first starts.
    # If the model file is missing or fails to load, we don't want the app
    # to crash with a confusing stack trace — we print a clear message and
    # stop the app on purpose instead.
    try:
        with app.app_context():
            ai_engine.load_model(app.config["MODEL_PATH"])
    except Exception as error:
        print("=" * 60)
        print("ERROR: Failed to load the AI model.")
        print(f"Reason: {error}")
        print("Check that MODEL_PATH in your .env file points to a valid")
        print("GGUF model file inside backend/models_gguf/.")
        print("=" * 60)
        sys.exit(1)

    # ---- 5. Register all API routes ----
    # All endpoints (/api/habits, /api/progress, /api/coach/generate, etc.)
    # are defined in routes.py as a single Blueprint, registered here.
    app.register_blueprint(routes_bp)

    # ---- 6. Serve the frontend ----
    # This route serves index.html when someone visits the root URL,
    # so the whole app (frontend + backend) can run from one server
    # during the hackathon demo.
    @app.route("/")
    def serve_frontend():
        return send_from_directory(app.static_folder, "index.html")

    # ---- 7. Health check ----
    # A simple endpoint to confirm the backend is up and responding,
    # useful for testing the server before wiring up the frontend.
    @app.route("/health")
    def health_check():
        return jsonify({
            "status": "ok",
            "message": "NeuroNest backend is running"
        })

    return app


# ---- Entry point ----
# Running `python app.py` directly starts the development server.
if __name__ == "__main__":
    app = create_app()
    # Debug mode is read from Config (not hardcoded) so it can be turned
    # on/off via an environment variable without editing this file.
    app.run(debug=app.config.get("DEBUG", False), host="0.0.0.0", port=5000)
