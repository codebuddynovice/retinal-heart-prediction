import sqlite3, os
from pathlib import Path

DB_PATH = Path(__file__).parent / "app.db"

def get_conn():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_conn() as conn:
        # Users Table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id       INTEGER PRIMARY KEY AUTOINCREMENT,
                name     TEXT    NOT NULL,
                email    TEXT    NOT NULL UNIQUE,
                hashed_pw TEXT   NOT NULL,
                created_at TEXT  DEFAULT (datetime('now'))
            )
        """)
        
        # Predictions / History Table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS predictions (
                id                INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id           INTEGER NOT NULL,
                image_filename    TEXT    NOT NULL,
                prediction_json   TEXT    NOT NULL,
                analysis_metrics  TEXT    NOT NULL,
                timestamp         TEXT    DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        conn.commit()

if __name__ == "__main__":
    init_db()
