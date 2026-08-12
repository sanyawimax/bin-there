import requests

BASE_URL = "https://bin-there.onrender.com/"


# =========================================================
# TEST /CLASSIFY
# =========================================================

print("\n========== TEST CLASSIFY ==========")

files = {
    "image": open("test-images/vegetable-waste.jfif", "rb")
}

data = {
    "user_id": "6a76e45ef932496015887cb5"
}

response = requests.post(
    f"{BASE_URL}/classify",
    files=files,
    data=data
)

print("Status code:", response.status_code)
print("Response:")
print(response.text)

files["image"].close()


# =========================================================
# TEST SIGNUP
# =========================================================

print("\n========== TEST SIGNUP ==========")

signup_data = {
    "name": "Test User",
    "email": "testuser123@example.com",
    "password": "test1234",
    "building": "Building A"
}

response = requests.post(
    f"{BASE_URL}/signup",
    json=signup_data
)

print("Status code:", response.status_code)
print("Response:")
print(response.text)


# =========================================================
# TEST USER
# =========================================================

print("\n========== TEST GET /USER ==========")

user_id = "YOUR_REAL_USER_OBJECTID"

response = requests.get(
    f"{BASE_URL}/user/{user_id}"
)

print("Status code:", response.status_code)
print("Response:")
print(response.text)


# =========================================================
# TEST HISTORY
# =========================================================

print("\n========== TEST GET /HISTORY ==========")

response = requests.get(
    f"{BASE_URL}/history/{user_id}"
)

print("Status code:", response.status_code)
print("Response:")
print(response.text)


# =========================================================
# TEST LEADERBOARD
# =========================================================

print("\n========== TEST LEADERBOARD ==========")

response = requests.get(
    f"{BASE_URL}/leaderboard"
)

print("Status code:", response.status_code)
print("Response:")
print(response.text)


# =========================================================
# TEST BUILDING LEADERBOARD
# =========================================================

print("\n========== TEST BUILDING LEADERBOARD ==========")

response = requests.get(
    f"{BASE_URL}/building-leaderboard"
)

print("Status code:", response.status_code)
print("Response:")
print(response.text)


# =========================================================
# TEST REDEEM
# =========================================================

print("\n========== TEST REDEEM ==========")

reward_id = "6a7732bd221d5d0abe2c8c6a"

redeem_data = {
    "user_id": user_id,
    "reward_id": reward_id
}

response = requests.post(
    f"{BASE_URL}/redeem",
    json=redeem_data
)

print("Status code:", response.status_code)
print("Response:")
print(response.text)


# =========================================================
# TEST MUNICIPAL PICKUPS
# =========================================================

print("\n========== TEST MUNICIPAL PICKUPS ==========")

response = requests.get(
    f"{BASE_URL}/municipal/pickups"
)

print("Status code:", response.status_code)
print("Response:")
print(response.text)


# =========================================================
# TEST MUNICIPAL STATS
# =========================================================

print("\n========== TEST MUNICIPAL STATS ==========")

response = requests.get(
    f"{BASE_URL}/municipal/stats"
)

print("Status code:", response.status_code)
print("Response:")
print(response.text)