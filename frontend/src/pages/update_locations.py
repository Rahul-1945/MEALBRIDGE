import pymongo
import requests

# MongoDB Connection
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["mealbridge"]
users_collection = db["users"]

# OpenCage API Key (Replace with your actual API Key)
API_KEY = "94675ddfc9344fd8bfc94aff3e6b01bb"
GEOCODE_URL = "https://api.opencagedata.com/geocode/v1/json"

def get_coordinates(address):
    """Fetch latitude and longitude from OpenCage API"""
    params = {"q": address, "key": API_KEY}
    response = requests.get(GEOCODE_URL, params=params).json()
    
    if response["status"]["code"] == 200 and response["results"]:
        location = response["results"][0]["geometry"]
        return location["lat"], location["lng"]
    return None, None

# Fetch users without lat/lng
users = users_collection.find({"latitude": {"$exists": False}, "longitude": {"$exists": False}})

for user in users:
    address = user.get("address")
    if address:
        lat, lng = get_coordinates(address)
        if lat and lng:
            users_collection.update_one({"_id": user["_id"]}, {"$set": {"latitude": lat, "longitude": lng}})
            print(f"Updated {user['name']} -> Lat: {lat}, Lng: {lng}")
        else:
            print(f"Could not fetch coordinates for {user['name']}")

print("Location update complete!")
