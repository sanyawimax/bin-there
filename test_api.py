import requests

# Open our test image
with open("test-images/vegetable-waste.jfif", "rb") as image:

    # Send the image to our Flask backend
    response = requests.post(
        "http://127.0.0.1:5000/classify",
        files={"image": image}
    )

# Show what the backend returned
print("Status code:", response.status_code)
print("Response:")
print(response.text)