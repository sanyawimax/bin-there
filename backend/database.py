import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

mongo_uri = os.getenv("MONGO_URI")

client = MongoClient(mongo_uri)

db = client["binthere"]

users = db["user"]
waste_records = db["waste_records"]

print("Database connected successfully!")