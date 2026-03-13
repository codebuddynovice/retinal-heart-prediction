from passlib.context import CryptContext

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
try:
    h = pwd_ctx.hash("password123")
    print(f"Hashed: {h}")
    print(f"Verify: {pwd_ctx.verify('password123', h)}")
except Exception as e:
    print(f"Bcrypt error: {e}")
