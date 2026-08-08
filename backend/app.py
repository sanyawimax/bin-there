import os
import sys
from datetime import datetime
from bson import ObjectId
from flask import Flask, request, jsonify
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
from database import users, waste_records

from ai.classifier import classify_waste


# --------------------------------
# FLASK
# --------------------------------

app = Flask(__name__)







# --------------------------------
# POINT SYSTEM
# --------------------------------

POINTS = {
    "Wet/Organic": 10,
    "Paper": 10,
    "Plastic": 10,
    "Glass": 15,
    "Metal": 15,
    "E-waste": 25,
    "Hazardous": 25,
    "Textile": 20,
    "Other": 0
}


# --------------------------------
# HOME
# --------------------------------

@app.route("/")
def home():
    return "BinThere backend is running!"


# --------------------------------
# CLASSIFY WASTE
# --------------------------------

@app.route("/classify", methods=["POST"])
def classify():

    # Get user ID
    user_id = request.form.get("user_id")

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    # Convert string ID to MongoDB ObjectId
    try:
        user_object_id = ObjectId(user_id)
    except Exception:
        return jsonify({"error": "Invalid user ID"}), 400

    # Find user
    user = users.find_one({"_id": user_object_id})

    if not user:
        return jsonify({"error": "User not found"}), 404

    # Get image
    image = request.files["image"]

    image_path = "temp_image.jpg"
    image.save(image_path)

    # Gemini classification
    result = classify_waste(image_path)

    category = result["category"]

    # Calculate points
    points = POINTS.get(category, 0)

    result["points"] = points
    result["timestamp"] = datetime.now()

    # Link record to user
    result["user_id"] = user_object_id

    # Update user's points
    users.update_one(
        {"_id": user_object_id},
        {"$inc": {"points": points}}
    )

    # Save waste record
    record_to_save = result.copy()

    inserted = waste_records.insert_one(record_to_save)

    # Prepare response
    response_data = result.copy()

    # ObjectId isn't JSON serializable,
    # so convert it only for the response
    response_data["user_id"] = str(user_object_id)
    response_data["id"] = str(inserted.inserted_id)

    return jsonify(response_data)
# --------------------------------
# RUN SERVER
# --------------------------------

if __name__ == "__main__":
    app.run(debug=True)