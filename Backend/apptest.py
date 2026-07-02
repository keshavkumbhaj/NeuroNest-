import sys

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

from config import Config
from database import db, init_db
from routes import routes_bp


def create_app():
    """
    Application factory.
    Building the app inside a function (instead of at the top of the file)
    keeps things clean and avoids circular imports between app.py, routes.py,
    and database.py.
    """

    # Tell Flask where the frontend files live.
    app = Flask(
        __name__,
        static_folder="../frontend",
        static_url_path=""
    )

    # ---- 1. Load configuration ----
    app.config.from_object(Config)

    # ---- 2. Enable CORS ----
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # ---- 3. Initialize the database ----
    db.init_app(app)
    with app.app_context():
        init_db()

    # ----------------------------------------------------
    # AI MODEL LOADING DISABLED FOR BACKEND TESTING
    #
    # The original app.py loads ai_engine.py here.
    # This test version skips AI loading so the backend
    # can be tested independently.
    # ----------------------------------------------------

    # ---- 4. Register API routes ----
    app.register_blueprint(routes_bp)

    # ---- 5. Serve frontend ----
    @app.route("/")
    def serve_frontend():
        return send_from_directory(app.static_folder, "index.html")

    # ---- 6. Health check ----
    @app.route("/health")
    def health_check():
        return jsonify({
            "status": "ok",
            "message": "NeuroNest backend is running"
        })

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(
        debug=app.config.get("DEBUG", False),
        host="0.0.0.0",
        port=5000
    )