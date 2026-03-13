import sqlite3
from pathlib import Path

DB_PATH = Path("app.db")
if not DB_PATH.exists():
    print("Database file does not exist.")
else:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    users = conn.execute("SELECT id, name, email FROM users").fetchall()
    print(f"Total users: {len(users)}")
    for user in users:
        print(dict(user))
    conn.close()
