"""
routes.py
---------
Defines every API endpoint the frontend talks to, grouped together on a
single Flask Blueprint called `routes_bp`. app.py registers this
blueprint, so every route below is automatically available once the app
starts.

Each function here does three things: read/validate the request,
talk to the database via SQLAlchemy, and return a JSON response with the
correct HTTP status code.
"""

from datetime import date

from flask import Blueprint, jsonify, request

from database import db
from models import Habit, DailyCompletion, Reflection

# All routes in this file are prefixed with /api automatically.
routes_bp = Blueprint("routes_bp", __name__, url_prefix="/api")


# ---------------------------------------------------------------------
# Helper: convert a Habit object into a JSON-friendly dictionary.
# Also includes whether it's completed TODAY, by checking for a
# matching DailyCompletion row — the frontend needs this to render
# the habit card correctly (checked vs. unchecked).
# ---------------------------------------------------------------------
def habit_to_dict(habit):
    today_record = DailyCompletion.query.filter_by(
        habit_id=habit.id, date=date.today()
    ).first()

    return {
        "id": habit.id,
        "name": habit.name,
        "category": habit.category,
        "icon": habit.icon,
        "completed": bool(today_record.completed) if today_record else False,
    }


# ---------------------------------------------------------------------
# GET /api/habits — return every habit, with today's completion status.
# ---------------------------------------------------------------------
@routes_bp.route("/habits", methods=["GET"])
def get_habits():
    try:
        habits = Habit.query.order_by(Habit.created_at.asc()).all()
        return jsonify({
            "success": True,
            "data": [habit_to_dict(h) for h in habits]
        }), 200
    except Exception as error:
        return jsonify({"success": False, "error": str(error)}), 500


# ---------------------------------------------------------------------
# POST /api/habits — create a new habit.
# Expects JSON: { "name": "...", "category": "...", "icon": "..." }
# ---------------------------------------------------------------------
@routes_bp.route("/habits", methods=["POST"])
def create_habit():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()

    # Basic validation — name is required, everything else has a default.
    if not name:
        return jsonify({"success": False, "error": "Habit name is required."}), 400

    if Habit.query.filter_by(name=name).first():
        return jsonify({"success": False, "error": "A habit with that name already exists."}), 409

    try:
        habit = Habit(
            name=name,
            category=(data.get("category") or "Wellbeing").strip(),
            icon=(data.get("icon") or "✨").strip(),
        )
        db.session.add(habit)
        db.session.commit()
        return jsonify({"success": True, "data": habit_to_dict(habit)}), 201
    except Exception as error:
        db.session.rollback()
        return jsonify({"success": False, "error": str(error)}), 500


# ---------------------------------------------------------------------
# DELETE /api/habits/<habit_id> — delete a habit (and its history, via
# the cascade relationship set up in models.py).
# ---------------------------------------------------------------------
@routes_bp.route("/habits/<int:habit_id>", methods=["DELETE"])
def delete_habit(habit_id):
    habit = Habit.query.get(habit_id)
    if not habit:
        return jsonify({"success": False, "error": "Habit not found."}), 404

    try:
        db.session.delete(habit)
        db.session.commit()
        return jsonify({"success": True, "data": {"id": habit_id}}), 200
    except Exception as error:
        db.session.rollback()
        return jsonify({"success": False, "error": str(error)}), 500


# ---------------------------------------------------------------------
# POST /api/habits/<habit_id>/complete — mark (or unmark) today's
# completion for a habit. If today's record already exists, it is
# toggled instead of creating a duplicate row.
# ---------------------------------------------------------------------
@routes_bp.route("/habits/<int:habit_id>/complete", methods=["POST"])
def toggle_habit_completion(habit_id):
    habit = Habit.query.get(habit_id)
    if not habit:
        return jsonify({"success": False, "error": "Habit not found."}), 404

    try:
        record = DailyCompletion.query.filter_by(
            habit_id=habit_id, date=date.today()
        ).first()

        if record:
            # Already has a row for today — flip it instead of duplicating.
            record.completed = not record.completed
        else:
            # First time toggling today — create a new completed row.
            record = DailyCompletion(habit_id=habit_id, date=date.today(), completed=True)
            db.session.add(record)

        db.session.commit()
        return jsonify({
            "success": True,
            "data": {"id": habit_id, "completed": record.completed}
        }), 200
    except Exception as error:
        db.session.rollback()
        return jsonify({"success": False, "error": str(error)}), 500


# ---------------------------------------------------------------------
# GET /api/progress — today's totals for the progress ring/bar.
# ---------------------------------------------------------------------
@routes_bp.route("/progress", methods=["GET"])
def get_progress():
    try:
        total_habits = Habit.query.count()
        completed_today = DailyCompletion.query.filter_by(
            date=date.today(), completed=True
        ).count()

        percentage = round((completed_today / total_habits) * 100) if total_habits else 0

        return jsonify({
            "success": True,
            "data": {
                "total": total_habits,
                "completed": completed_today,
                "percentage": percentage,
            }
        }), 200
    except Exception as error:
        return jsonify({"success": False, "error": str(error)}), 500


# ---------------------------------------------------------------------
# POST /api/reflection — save (create or update) today's reflection.
# Expects JSON: { "content": "..." }
# ---------------------------------------------------------------------
@routes_bp.route("/reflection", methods=["POST"])
def save_reflection():
    data = request.get_json(silent=True) or {}
    content = data.get("content", "")

    try:
        reflection = Reflection.query.filter_by(date=date.today()).first()

        if reflection:
            reflection.content = content  # update existing entry
        else:
            reflection = Reflection(date=date.today(), content=content)
            db.session.add(reflection)

        db.session.commit()
        return jsonify({
            "success": True,
            "data": {"date": str(reflection.date), "content": reflection.content}
        }), 200
    except Exception as error:
        db.session.rollback()
        return jsonify({"success": False, "error": str(error)}), 500


# ---------------------------------------------------------------------
# GET /api/reflection — return today's reflection (empty if none yet).
# ---------------------------------------------------------------------
@routes_bp.route("/reflection", methods=["GET"])
def get_reflection():
    try:
        reflection = Reflection.query.filter_by(date=date.today()).first()

        content = reflection.content if reflection else ""
        return jsonify({
            "success": True,
            "data": {"date": str(date.today()), "content": content}
        }), 200
    except Exception as error:
        return jsonify({"success": False, "error": str(error)}), 500


# ---------------------------------------------------------------------
# POST /api/coach — placeholder for the on-device AI coach.
# Real llama.cpp integration will replace this response later.
# ---------------------------------------------------------------------
@routes_bp.route("/coach", methods=["POST"])
def generate_coach_advice():
    return jsonify({
        "success": True,
        "message": "AI coach integration coming soon."
    }), 200
