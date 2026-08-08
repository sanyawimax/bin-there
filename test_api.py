import requests

url = "http://127.0.0.1:5000/classify"

files = {
    "image": open("test-images/vegetable-waste.jfif", "rb")
}

data = {
    "user_id": "6a76e45ef932496015887cb5"
}

response = requests.post(
    url,
    files=files,
    data=data
)

print("Status code:", response.status_code)
print("Response:")
print(response.text)

# -------------------------
# Test /user
# -------------------------

print("\nTesting GET /user...")

user_id = "66b4c103a1b2c3d4e5f67892"

response = requests.get(
    f"http://127.0.0.1:5000/user/{user_id}"
)

print("Status code:", response.status_code)
print("Response:")
print(response.text)

# -------------------------
# Test /history
# -------------------------

print("\nTesting GET /history...")

user_id = "YOUR_USER_OBJECTID"

response = requests.get(
    f"http://127.0.0.1:5000/history/{user_id}"
)

print("Status code:", response.status_code)
print("Response:")
print(response.text)