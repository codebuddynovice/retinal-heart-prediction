import requests

def test_registration():
    url = "http://localhost:8000/auth/register"
    data = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123"
    }
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_registration()
