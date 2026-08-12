import os
import sys
from datetime import datetime

from bson import ObjectId
from flask import Flask, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
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

from backend.database import (
    users,
    waste_records,
    rewards,
    redemptions,
    pickups
)

from ai.classifier import classify_waste


# --------------------------------
# FLASK
# --------------------------------

app = Flask(__name__)

# Allow frontend to communicate with Flask
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

        # Convert datetime to JSON-compatible string
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
# AUTH: SIGNUP
# --------------------------------

@app.route("/signup", methods=["POST"])
def signup():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "JSON body required"
        }), 400

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    building = data.get("building")

    if not name or not email or not password:
        return jsonify({
            "error": "name, email, and password are required"
        }), 400

    # Check if email is already registered
    existing_user = users.find_one({
        "email": email
    })

    if existing_user:
        return jsonify({
            "error": "Email already registered"
        }), 409

    # Hash password before storing
    password_hash = generate_password_hash(password)

    new_user = {
        "name": name,
        "email": email,
        "password_hash": password_hash,
        "building": building,
        "points": 0,
        "total_recycled_kg": 0
    }

    inserted = users.insert_one(new_user)

    return jsonify({
        "user_id": str(inserted.inserted_id),
        "name": name,
        "email": email,
        "building": building,
        "points": 0,
        "total_recycled_kg": 0
    }), 201


# --------------------------------
# AUTH: LOGIN
# --------------------------------

@app.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "JSON body required"
        }), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "error": "email and password are required"
        }), 400

    user = users.find_one({
        "email": email
    })

    if not user or not check_password_hash(
        user.get("password_hash", ""),
        password
    ):
        return jsonify({
            "error": "Invalid email or password"
        }), 401

    return jsonify({
        "user_id": str(user["_id"]),
        "name": user.get("name"),
        "email": user.get("email"),
        "building": user.get("building"),
        "points": user.get("points", 0),
        "total_recycled_kg": user.get(
            "total_recycled_kg",
            0
        )
    })


# --------------------------------
# GET USER PROFILE
# --------------------------------

@app.route("/user/<user_id>", methods=["GET"])
def get_user(user_id):

    try:
        user_object_id = ObjectId(user_id)

    except Exception:
        return jsonify({
            "error": "Invalid user ID"
        }), 400

    user = users.find_one({
        "_id": user_object_id
    })

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    return jsonify({
        "name": user.get("name"),
        "email": user.get("email"),
        "points": user.get(
            "points",
            0
        ),
        "building": user.get("building"),
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

    try:
        user_object_id = ObjectId(user_id)

    except Exception:
        return jsonify({
            "error": "Invalid user ID"
        }), 400

    user = users.find_one({
        "_id": user_object_id
    })

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

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

        timestamp = record.get("timestamp")

        history.append({
            "category": record.get("category"),
            "object": record.get("object"),
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
# GET INDIVIDUAL LEADERBOARD
# --------------------------------

@app.route("/leaderboard", methods=["GET"])
def get_leaderboard():

    users_list = users.find(
        {},
        {
            "name": 1,
            "points": 1,
            "building": 1
        }
    ).sort(
        "points",
        -1
    )

    leaderboard = []

    for rank, user in enumerate(
        users_list,
        start=1
    ):

        leaderboard.append({
            "rank": rank,
            "name": user.get("name"),
            "points": user.get(
                "points",
                0
            ),
            "building": user.get(
                "building"
            )
        })

    return jsonify(leaderboard)


# --------------------------------
# GET BUILDING WISE LEADERBOARD
# --------------------------------

@app.route("/building-leaderboard", methods=["GET"])
def get_building_leaderboard():

    pipeline = [
        {
            "$group": {
                "_id": "$building",
                "total_points": {
                    "$sum": "$points"
                },
                "total_recycled_kg": {
                    "$sum": "$total_recycled_kg"
                },
                "members": {
                    "$sum": 1
                }
            }
        },
        {
            "$sort": {
                "total_points": -1
            }
        }
    ]

    buildings = users.aggregate(
        pipeline
    )

    leaderboard = []

    for building in buildings:

        leaderboard.append({
            "building": building["_id"],
            "total_points": building.get(
                "total_points",
                0
            ),
            "total_recycled_kg": building.get(
                "total_recycled_kg",
                0
            ),
            "members": building.get(
                "members",
                0
            )
        })

    return jsonify(leaderboard)


# --------------------------------
# REWARDS SYSTEM
# --------------------------------

@app.route("/rewards", methods=["GET"])
def get_rewards():

    reward_list = rewards.find(
        {
            "available": True
        },
        {
            "name": 1,
            "description": 1,
            "points_required": 1,
            "partner": 1
        }
    )

    result = []

    for reward in reward_list:

        result.append({
            "id": str(
                reward["_id"]
            ),
            "name": reward.get(
                "name"
            ),
            "description": reward.get(
                "description"
            ),
            "points_required": reward.get(
                "points_required",
                0
            ),
            "partner": reward.get(
                "partner"
            )
        })

    return jsonify(result)


# --------------------------------
# REDEEM REWARDS
# --------------------------------

@app.route("/redeem", methods=["POST"])
def redeem_reward():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    user_id = data.get("user_id")
    reward_id = data.get("reward_id")

    if not user_id or not reward_id:
        return jsonify({
            "error": (
                "user_id and reward_id "
                "are required"
            )
        }), 400

    try:
        user_object_id = ObjectId(user_id)
        reward_object_id = ObjectId(reward_id)

    except Exception:
        return jsonify({
            "error": (
                "Invalid user ID or reward ID"
            )
        }), 400

    user = users.find_one({
        "_id": user_object_id
    })

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    reward = rewards.find_one({
        "_id": reward_object_id,
        "available": True
    })

    if not reward:
        return jsonify({
            "error": "Reward not found"
        }), 404

    user_points = user.get(
        "points",
        0
    )

    required_points = reward.get(
        "points_required",
        0
    )

    if user_points < required_points:
        return jsonify({
            "error": "Insufficient points",
            "your_points": user_points,
            "required_points": required_points
        }), 400

    users.update_one(
        {
            "_id": user_object_id
        },
        {
            "$inc": {
                "points": -required_points
            }
        }
    )

    redemption = {
        "user_id": user_object_id,
        "reward_id": reward_object_id,
        "reward_name": reward.get("name"),
        "points_spent": required_points,
        "status": "successful",
        "timestamp": datetime.now()
    }

    redemptions.insert_one(
        redemption
    )

    return jsonify({
        "message": "Reward redeemed successfully!",
        "reward": reward.get("name"),
        "points_spent": required_points,
        "remaining_points": (
            user_points - required_points
        )
    }), 200


# --------------------------------
# GET PICKUP INFO
# --------------------------------

@app.route("/municipal/pickups", methods=["GET"])
def get_pickups():

    pickup_list = pickups.find(
        {},
        {
            "building": 1,
            "area": 1,
            "fill_level": 1,
            "status": 1,
            "vehicle_id": 1,
            "priority": 1
        }
    )

    result = []

    for pickup in pickup_list:

        result.append({
            "id": str(
                pickup["_id"]
            ),
            "building": pickup.get(
                "building"
            ),
            "area": pickup.get(
                "area"
            ),
            "fill_level": pickup.get(
                "fill_level",
                0
            ),
            "status": pickup.get(
                "status"
            ),
            "vehicle_id": pickup.get(
                "vehicle_id"
            ),
            "priority": pickup.get(
                "priority"
            )
        })

    return jsonify(result)


# --------------------------------
# MUNICIPAL DASHBOARD STATS
# --------------------------------
@app.route("/municipal/stats", methods=["GET"])
def get_municipal_stats():

    total_users = users.count_documents({})

    total_waste_records = (
        waste_records.count_documents({})
    )

    recycled_result = list(
        users.aggregate([
            {
                "$group": {
                    "_id": None,
                    "total": {
                        "$sum": {
                            "$ifNull": [
                                "$total_recycled_kg",
                                0
                            ]
                        }
                    },
                    "points": {
                        "$sum": {
                            "$ifNull": [
                                "$points",
                                0
                            ]
                        }
                    }
                }
            }
        ])
    )

    total_recycled_kg = 0
    total_points = 0

    if recycled_result:

        total_recycled_kg = (
            recycled_result[0].get(
                "total",
                0
            )
        )

        total_points = (
            recycled_result[0].get(
                "points",
                0
            )
        )

    buildings = users.distinct(
        "building"
    )

    # Prototype estimate.
    # This is an estimated impact metric,
    # not a scientific measurement.
    estimated_co2_saved = round(
        total_recycled_kg * 1.5,
        2
    )

    return jsonify({
        "total_users": total_users,
        "total_waste_records": total_waste_records,
        "total_recycled_kg": round(
            total_recycled_kg,
            2
        ),
        "total_points_distributed": total_points,
        "participating_buildings": len(
            buildings
        ),
        "estimated_co2_saved_kg": (
            estimated_co2_saved
        )
    })


# --------------------------------
# OPTIMUM ROUTE
# (HIGHEST PRIORITY ALGORITHM)
# --------------------------------

@app.route("/municipal/route", methods=["GET"])
def get_collection_route():

    pickup_list = pickups.find(
        {},
        {
            "building": 1,
            "area": 1,
            "fill_level": 1,
            "priority": 1
        }
    ).sort(
        "fill_level",
        -1
    )

    route = []

    for position, pickup in enumerate(
        pickup_list,
        start=1
    ):

        route.append({
            "stop": position,
            "building": pickup.get(
                "building"
            ),
            "area": pickup.get(
                "area"
            ),
            "fill_level": pickup.get(
                "fill_level",
                0
            ),
            "priority": pickup.get(
                "priority"
            )
        })

    return jsonify(route)


# --------------------------------
# RUN SERVER
# --------------------------------

if __name__ == "__main__":
    app.run(debug=True)