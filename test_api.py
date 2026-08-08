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