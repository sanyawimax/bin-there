import os
from datetime import datetime

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient
from google.genai import errors

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

    image_path = "temp_image.jpg"

    try:

        # --------------------------------
        # CHECK UPLOADED IMAGE
        # --------------------------------

        if "image" not in request.files:
            return jsonify({
                "error": "No image was uploaded."
            }), 400

        image = request.files["image"]

        if image.filename == "":
            return jsonify({
                "error": "No image was selected."
            }), 400

        # --------------------------------
        # SAVE TEMPORARILY
        # --------------------------------

        image.save(image_path)

        # --------------------------------
        # GEMINI CLASSIFICATION
        # --------------------------------

        result = classify_waste(image_path)

        # --------------------------------
        # CHECK AI RESULT
        # --------------------------------

        category = result.get("category")

        if category not in POINTS:
            return jsonify({
                "error": "AI returned an invalid waste category."
            }), 500

        # --------------------------------
        # CALCULATE POINTS
        # --------------------------------

        points = POINTS[category]

        result["points"] = points
        result["timestamp"] = datetime.now().isoformat()

        # --------------------------------
        # SAVE TO MONGODB
        # --------------------------------

        record_to_save = result.copy()

        inserted = waste_records.insert_one(record_to_save)

        # --------------------------------
        # RESPONSE TO FRONTEND
        # --------------------------------

        response_data = result.copy()

        response_data["id"] = str(inserted.inserted_id)

        return jsonify(response_data), 200

    # --------------------------------
    # GEMINI API ERRORS
    # --------------------------------

    except errors.ClientError as e:

        print("Gemini API error:", e)

        if e.code == 429:
            return jsonify({
                "error": "AI service is temporarily unavailable. Please try again later."
            }), 429

        return jsonify({
            "error": "The AI service could not process your image."
        }), 502

    # --------------------------------
    # OTHER SERVER ERRORS
    # --------------------------------

    except Exception as e:

        print("Server error:", e)

        return jsonify({
            "error": "Something went wrong on the server."
        }), 500

    # --------------------------------
    # DELETE TEMP IMAGE
    # --------------------------------

    finally:

        if os.path.exists(image_path):
            os.remove(image_path)
if __name__ == "__main__":
    app.run(debug=True)