import sqlite3
from pathlib import Path
import os

# Check database.py's DB_PATH
try:
    from database import DB_PATH
    print(f"database.py thinks DB is at: {DB_PATH}")
except ImportError:
    print("Could not import DB_PATH from database")

possible_dbs = ["app.db", "users.db", "backend/app.db", "backend/users.db"]
for db_name in possible_dbs:
    p = Path(db_name)
    if p.exists():
        print(f"Found {db_name} at {p.absolute()}")
        try:
            conn = sqlite3.connect(str(p))
            conn.row_factory = sqlite3.Row
            tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
            print(f"Tables in {db_name}: {[t['name'] for t in tables]}")
            if any(t['name'] == 'users' for t in tables):
                users = conn.execute("SELECT id, name, email FROM users").fetchall()
                print(f"Users in {db_name}: {len(users)}")
                for u in users: print(dict(u))
            conn.close()
        except Exception as e:
            print(f"Error reading {db_name}: {e}")
    else:
        print(f"{db_name} does not exist.")
