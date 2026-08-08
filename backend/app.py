```python
import os
import sys
from datetime import datetime

from bson import ObjectId
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from google.genai import errors

# Allow imports from the project root
sys.path.append(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

from database import users, waste_records
from ai.classifier import classify_waste


# --------------------------------
# FLASK
# --------------------------------

app = Flask(__name__)
CORS(app)


# --------------------------------
# ENVIRONMENT
# --------------------------------

load_dotenv()


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
# ESTIMATED WASTE WEIGHT
# --------------------------------

ESTIMATED_WEIGHT_KG = {
    "plastic": 0.02,
    "paper": 0.05,
    "glass": 0.30,
    "metal": 0.15,
    "e-waste": 0.20,
    "organic": 0.10
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
        # CHECK USER ID
        # --------------------------------

        user_id = request.form.get("user_id")

        if not user_id:
            return jsonify({
                "error": "user_id is required"
            }), 400

        # --------------------------------
        # CONVERT USER ID
        # --------------------------------

        try:
            user_object_id = ObjectId(user_id)

        except Exception:
            return jsonify({
                "error": "Invalid user ID"
            }), 400

        # --------------------------------
        # CHECK USER EXISTS
        # --------------------------------

        user = users.find_one({
            "_id": user_object_id
        })

        if not user:
            return jsonify({
                "error": "User not found"
            }), 404

        # --------------------------------
        # CHECK IMAGE
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
        # SAVE IMAGE TEMPORARILY
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

        # --------------------------------
        # ESTIMATED WEIGHT
        # --------------------------------

        estimated_weight = ESTIMATED_WEIGHT_KG.get(
            category.lower(),
            0
        )

        # --------------------------------
        # ADD DATA TO RESULT
        # --------------------------------

        result["points"] = points

        result["estimated_weight_kg"] = estimated_weight

        result["timestamp"] = datetime.now()

        result["user_id"] = user_object_id

        # --------------------------------
        # UPDATE USER POINTS
        # --------------------------------

        users.update_one(
            {
                "_id": user_object_id
            },
            {
                "$inc": {
                    "points": points,
                    "total_recycled_kg": estimated_weight
                }
            }
        )

        # --------------------------------
        # SAVE WASTE RECORD
        # --------------------------------

        record_to_save = result.copy()

        inserted = waste_records.insert_one(
            record_to_save
        )

        # --------------------------------
        # PREPARE RESPONSE
        # --------------------------------

        response_data = result.copy()

        response_data["user_id"] = str(
            user_object_id
        )

        response_data["id"] = str(
            inserted.inserted_id
        )

        # datetime is not JSON serializable
        response_data["timestamp"] = (
            result["timestamp"].isoformat()
        )

        return jsonify(response_data), 200


    # --------------------------------
    # GEMINI API ERRORS
    # --------------------------------

    except errors.ClientError as e:

        print("Gemini API error:", e)

        if e.code == 429:
            return jsonify({
                "error": (
                    "AI service is temporarily unavailable. "
                    "Please try again later."
                )
            }), 429

        return jsonify({
            "error": (
                "The AI service could not process "
                "your image."
            )
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

            try:
                os.remove(image_path)

            except Exception as e:
                print(
                    "Could not delete temporary image:",
                    e
                )


# --------------------------------
# GET USER PROFILE
# --------------------------------

@app.route("/user/<user_id>", methods=["GET"])
def get_user(user_id):

    # Convert ID
    try:

        user_object_id = ObjectId(user_id)

    except Exception:

        return jsonify({
            "error": "Invalid user ID"
        }), 400

    # Find user
    user = users.find_one({
        "_id": user_object_id
    })

    if not user:

        return jsonify({
            "error": "User not found"
        }), 404

    # Return user information
    return jsonify({

        "name": user.get("name"),

        "email": user.get("email"),

        "points": user.get(
            "points",
            0
        ),

        "building": user.get(
            "building"
        ),

        "total_recycled_kg": user.get(
            "total_recycled_kg",
            0
        )
    })


# --------------------------------
# GET USER HISTORY
# --------------------------------

@app.route("/history/<user_id>", methods=["GET"])
def get_history(user_id):

    # Convert ID
    try:

        user_object_id = ObjectId(user_id)

    except Exception:

        return jsonify({
            "error": "Invalid user ID"
        }), 400

    # Check user
    user = users.find_one({
        "_id": user_object_id
    })

    if not user:

        return jsonify({
            "error": "User not found"
        }), 404

    # Find user's waste records
    records = waste_records.find(
        {
            "user_id": user_object_id
        }
    ).sort(
        "timestamp",
        -1
    )

    history = []

    for record in records:

        timestamp = record.get(
            "timestamp"
        )

        history.append({

            "category": record.get(
                "category"
            ),

            "object": record.get(
                "object"
            ),

            "points": record.get(
                "points",
                0
            ),

            "estimated_weight_kg": record.get(
                "estimated_weight_kg",
                0
            ),

            "timestamp": (
                timestamp.isoformat()
                if timestamp
                else None
            )
        })

    return jsonify(history)


# --------------------------------
# RUN SERVER
# --------------------------------

if __name__ == "__main__":
    app.run(debug=True)
```
