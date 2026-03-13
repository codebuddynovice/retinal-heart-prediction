import sqlite3
import os
import json

from pathlib import Path

db = Path(__file__).parent / "app.db"
if db.exists():
    conn = sqlite3.connect(str(db))
    conn.row_factory = sqlite3.Row
    
    print("=== USERS ===")
    users = conn.execute("SELECT id, name, email, created_at FROM users").fetchall()
    for u in users:
        print(dict(u))
    
    print("\n=== PREDICTIONS (HISTORY) ===")
    history = conn.execute("SELECT id, user_id, image_filename, timestamp FROM predictions").fetchall()
    for h in history:
        print(dict(h))
        
    conn.close()
else:
    print(f"{db} Not found")
