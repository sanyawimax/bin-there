import os
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime

load_dotenv()

# Get MongoDB URI
mongo_uri = os.getenv("MONGO_URI")

# Connect to MongoDB
client = MongoClient(mongo_uri)

# Test connection
client.admin.command("ping")

print("MongoDB connection successful!")

# Select database
db = client["binthere"]

# Select collection
waste_records = db["waste_records"]

# Create a test waste record
record = {
    "category": "Plastic",
    "object": "Plastic bottle",
    "confidence": "high",
    "disposal": "Dry Waste",
    "points": 10,
    "timestamp": datetime.now()
}

# Insert the record
result = waste_records.insert_one(record)

print("Record inserted successfully!")
print("Record ID:", result.inserted_id)