# TaskFlow — Todo App
A modern Todo App built with Flask + MongoDB.

## How to Run

1. Make sure MongoDB is running on your machine.

2. Install dependencies:
   ```
   python -m pip install -r requirements.txt
   ```

3. Run the app:
   ```
   python app.py
   ```

4. Open your browser and go to:
   ```
   http://localhost:5000
   ```

## Features
- Add tasks with priority (High / Medium / Low)
- Mark tasks as done / undo
- Edit existing tasks
- Delete tasks
- Filter by All / Active / Completed
- Progress bar showing completion percentage
- Clear all completed tasks at once
- Data saved in MongoDB (persists after restart)
