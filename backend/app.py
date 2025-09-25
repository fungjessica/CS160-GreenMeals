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


if __name__ == "__main__":
    app.run(debug=True)
