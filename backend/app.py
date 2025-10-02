from flask import Flask, request, jsonify
import requests
import os

app = Flask(__name__)

YELP_API_KEY = "SeMVqOcTs3fB6lvE2mIdSsrn9KApbk7GKM5EAAQQiGpHiR9J2yfLW2J_fx2luw2QC11lDH9XV5EuySo0yimf_NGUOnLz1GyvUTRVWHK_IabIqFtPIgEPGufYkJfUaHYx"

@app.route("/restaurants")
def get_restaurants():
    query = request.args.get("q", "")
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    headers = {"Authorization": f"Bearer {YELP_API_KEY}"}
    url = "https://api.yelp.com/v3/businesses/search"
    params = {
        "term": query,
        "latitude": lat,
        "longitude": lon,
        "categories": "restaurants",
        "limit": 10
    }

    resp = requests.get(url, headers=headers, params=params)
    return jsonify(resp.json())

# In-memory "database" for now
users = {}

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if email in users:
        return jsonify({"message": "User already exists"}), 400
    
    users[email] = password
    return jsonify({"message": "Registration successful"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if email not in users or users[email] != password:
        return jsonify({"message": "Invalid credentials"}), 401
    
    return jsonify({"message": "Login successful"}), 200

if __name__ == "__main__":
    app.run(debug=True)
