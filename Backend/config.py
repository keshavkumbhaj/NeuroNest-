"""
config.py
---------
Holds all app settings in one place. Values are read from a .env file
so secrets/paths never need to be hardcoded or committed to git.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load variables from .env into the environment (does nothing if no .env exists)
load_dotenv()

# Base directory of the backend folder (this file's location).
# Using pathlib keeps paths correct on Windows, Mac, and Linux alike.
BASE_DIR = Path(__file__).resolve().parent


class Config:
    # ---- General Flask settings ----
    # DEBUG controls Flask's debug mode. Defaults to "False" if not set.
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"

    # Used by Flask for sessions/cookies. Change this in your own .env.
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")

    # ---- Database settings ----
    # SQLite file always lives at backend/instance/neuronest.db
    DATABASE_PATH = BASE_DIR / "instance" / "neuronest.db"

    # Make sure the "instance" folder exists so SQLite can create the file.
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)

    SQLALCHEMY_DATABASE_URI = f"sqlite:///{DATABASE_PATH}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # not needed, saves memory

    # ---- AI model settings ----
    # Only the *filename* comes from .env — the folder is always
    # backend/models_gguf/, so teammates just drop their .gguf file there.
    MODEL_DIR = BASE_DIR / "models_gguf"
    MODEL_FILENAME = os.getenv("MODEL_FILENAME", "your-model.gguf")
    MODEL_PATH = str(MODEL_DIR / MODEL_FILENAME)
