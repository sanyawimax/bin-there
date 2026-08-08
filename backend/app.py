import os
from datetime import datetime

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient

from ai.classifier import classify_waste


# --------------------------------
# FLASK
# --------------------------------

app = Flask(__name__)
CORS(app)


# --------------------------------
# MONGODB
# --------------------------------

load_dotenv()

mongo_uri = os.getenv("MONGO_URI")

client = MongoClient(mongo_uri)

db = client["binthere"]

waste_records = db["waste_records"]


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

    # Get uploaded image
    image = request.files["image"]

    # Save temporarily
    image_path = "temp_image.jpg"
    image.save(image_path)

    # Gemini classification
    result = classify_waste(image_path)

    # Get category
    category = result["category"]

    # Calculate points
    points = POINTS.get(category, 0)

    # Add points and timestamp
    result["points"] = points
    result["timestamp"] = datetime.now().isoformat()

    # --------------------------------
    # SAVE A COPY TO MONGODB
    # --------------------------------

    # Make a separate copy BEFORE MongoDB adds its _id
    record_to_save = result.copy()

    inserted = waste_records.insert_one(record_to_save)

    # --------------------------------
    # RESPONSE TO FRONTEND
    # --------------------------------

    # Keep MongoDB's ObjectId out of the response
    response_data = result.copy()

    # Give frontend the ID as a normal string
    response_data["id"] = str(inserted.inserted_id)

    return jsonify(response_data)
# --------------------------------
# RUN SERVER
# --------------------------------

if __name__ == "__main__":
    app.run(debug=True)