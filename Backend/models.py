"""
models.py
---------
Defines the database tables as Python classes, using Flask-SQLAlchemy.

Each class below becomes a table in neuronest.db. `db` is imported from
database.py so every model uses the same shared SQLAlchemy instance that
app.py already connected to the Flask app.
"""

from datetime import datetime, date
from database import db


class Habit(db.Model):
    """
    One row = one habit the user is tracking (e.g. "Morning Meditation").
    This table only stores PERMANENT information about the habit itself —
    not whether it was done today. Daily completion status now lives in
    its own table, DailyCompletion, below.
    """
    __tablename__ = "habits"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(40), nullable=False, unique=True)
    category = db.Column(db.String(24), nullable=False, default="Wellbeing")
    icon = db.Column(db.String(4), nullable=False, default="✨")

    # Automatically set once, when the habit is first created.
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # This lets us write `some_habit.completions` in Python to get every
    # DailyCompletion row linked to this habit (its full history).
    # It does NOT create a new column — SQLAlchemy builds it automatically
    # using the foreign key defined on DailyCompletion below.
    # cascade="all, delete-orphan" means: if a Habit is deleted, its
    # completion history rows are deleted with it (no orphaned rows left).
    completions = db.relationship(
        "DailyCompletion",
        backref="habit",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Habit id={self.id} name='{self.name}'>"


class DailyCompletion(db.Model):
    """
    One row = whether ONE specific habit was completed on ONE specific day.
    Over time this builds a full history per habit, which is what powers
    streaks, the weekly chart, and AI coaching insights.

    habit_id is a Foreign Key — it stores the id of the Habit this row
    belongs to, linking the two tables together.
    """
    __tablename__ = "daily_completions"

    id = db.Column(db.Integer, primary_key=True)

    # Links this row to a specific Habit (habits.id).
    habit_id = db.Column(db.Integer, db.ForeignKey("habits.id"), nullable=False)

    date = db.Column(db.Date, nullable=False, default=date.today)
    completed = db.Column(db.Boolean, nullable=False, default=False)

    # A habit should only have ONE completion record per day.
    __table_args__ = (
        db.UniqueConstraint("habit_id", "date", name="unique_habit_per_day"),
    )

    def __repr__(self):
        return f"<DailyCompletion habit_id={self.habit_id} date={self.date} completed={self.completed}>"


class Reflection(db.Model):
    """
    One row per day, storing the user's free-text reflection/journal entry
    from the "Mindful check-in" textarea on the dashboard.
    """
    __tablename__ = "reflections"

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False, unique=True, default=date.today)
    content = db.Column(db.Text, nullable=False, default="")

    # Updated every time the reflection is saved (not just when created).
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Reflection date={self.date} chars={len(self.content)}>"
