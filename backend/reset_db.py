import sqlite3
from pathlib import Path

db_path = Path(__file__).parent / "app.db"

def clear_database():
    if not db_path.exists():
        print("Database not found.")
        return

    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Delete all predictions
        cursor.execute("DELETE FROM predictions;")
        # Delete all users
        cursor.execute("DELETE FROM users;")
        
        # Reset auto-increment counters
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='users';")
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='predictions';")
        
        conn.commit()
        conn.close()
        print("Successfully cleared all users and diagnostic history from the database.")
    except Exception as e:
        print(f"Error clearing database: {e}")

if __name__ == "__main__":
    confirm = input("Are you sure you want to delete ALL data? (yes/no): ")
    if confirm.lower() == 'yes':
        clear_database()
    else:
        print("Operation cancelled.")
