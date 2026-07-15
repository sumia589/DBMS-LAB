from flask import Flask, render_template, request, redirect, url_for, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId
from dotenv import load_dotenv
from datetime import datetime
import os

load_dotenv()

app = Flask(__name__)

# ── Database Connection ──────────────────────────────────────────────────────
client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/"))
db = client["todo_app_db"]
todos = db["todos"]

# ── Routes ───────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    """Home page — show all todos sorted by creation date (newest first)."""
    filter_status = request.args.get("filter", "all")

    if filter_status == "active":
        query = {"done": False}
    elif filter_status == "completed":
        query = {"done": True}
    else:
        query = {}

    all_todos = list(todos.find(query).sort("created_at", -1))

    total     = todos.count_documents({})
    completed = todos.count_documents({"done": True})
    active    = todos.count_documents({"done": False})

    return render_template(
        "index.html",
        todos=all_todos,
        filter_status=filter_status,
        total=total,
        completed=completed,
        active=active,
    )


@app.route("/add", methods=["POST"])
def add():
    """Add a new todo task."""
    task     = request.form.get("task", "").strip()
    priority = request.form.get("priority", "medium")

    if task:
        todos.insert_one({
            "task":       task,
            "done":       False,
            "priority":   priority,
            "created_at": datetime.utcnow(),
        })
    return redirect(url_for("index"))


@app.route("/toggle/<task_id>")
def toggle(task_id):
    """Toggle a todo between done and not done."""
    todo = todos.find_one({"_id": ObjectId(task_id)})
    if todo:
        todos.update_one(
            {"_id": ObjectId(task_id)},
            {"$set": {"done": not todo["done"]}}
        )
    return redirect(request.referrer or url_for("index"))


@app.route("/delete/<task_id>")
def delete(task_id):
    """Delete a single todo."""
    todos.delete_one({"_id": ObjectId(task_id)})
    return redirect(request.referrer or url_for("index"))


@app.route("/clear-completed")
def clear_completed():
    """Delete all completed todos at once."""
    todos.delete_many({"done": True})
    return redirect(url_for("index"))


@app.route("/edit/<task_id>", methods=["POST"])
def edit(task_id):
    """Edit the text of an existing todo."""
    new_task = request.form.get("task", "").strip()
    if new_task:
        todos.update_one(
            {"_id": ObjectId(task_id)},
            {"$set": {"task": new_task}}
        )
    return redirect(url_for("index"))


# ── Run ──────────────────────────────────────────────────────────────────────
import webbrowser
import threading

if __name__ == "__main__":
    threading.Timer(1, lambda: webbrowser.open("http://127.0.0.1:5000")).start()
    app.run(debug=True)
