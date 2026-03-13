from auth import TokenOut, UserOut

try:
    obj = TokenOut(
        access_token="test",
        user=UserOut(id=1, name="Test", email="test@test.com")
    )
    print("Pydantic models work fine!")
    print(obj.json())
except Exception as e:
    print(f"Pydantic error: {e}")
