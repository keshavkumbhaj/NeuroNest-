"""
database.py
------------
Sets up the database connection for the whole app.

SQLAlchemy is an ORM (Object-Relational Mapper) — it lets us work with
the database using normal Python classes and objects instead of writing
raw SQL queries by hand.
"""

from flask_sqlalchemy import SQLAlchemy

# The SQLAlchemy object is created here, at the top level of the file,
# so it exists as ONE shared instance the whole app can import and use.
# models.py will import this same `db` to define tables, and app.py
# will call db.init_app(app) to connect it to the Flask app.
# Creating it here (instead of inside app.py) avoids circular imports:
# models.py needs `db`, and app.py needs the models — this file sits
# in between them.
db = SQLAlchemy()


def init_db():
    """
    Creates all database tables if they don't already exist.

    This must be called AFTER db.init_app(app) and INSIDE an app context,
    since SQLAlchemy needs to know which Flask app (and config) to use.

    Models are imported here, inside the function, rather than at the
    top of this file. This is intentional: models.py will import `db`
    from this file, so importing models.py at the top here would create
    a circular import. Importing it locally, only when init_db() runs,
    avoids that problem while still registering the tables before
    db.create_all() is called.
    """
    try:
        from models import Habit, DailyCompletion, Reflection  # noqa: F401

        db.create_all()
        print("Database initialized successfully.")
    except Exception as error:
        print("=" * 60)
        print("ERROR: Failed to initialize the database.")
        print(f"Reason: {error}")
        print("Check that config.py has a valid SQLALCHEMY_DATABASE_URI")
        print("and that the backend/instance/ folder is writable.")
        print("=" * 60)
