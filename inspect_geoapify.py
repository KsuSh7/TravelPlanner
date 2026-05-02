import os
import requests
from dotenv import load_dotenv
from pprint import pprint

load_dotenv()

API_KEY = os.getenv("GEOAPIFY_API_KEY")

TEST_LOCATIONS = [
    {
        "name": "Maldives",
        "lon": 73.2207,
        "lat": 3.2028
    },
    {
        "name": "Madeira",
        "lon": -16.9241,
        "lat": 32.6669
    }
]

CATEGORIES = [
    "natural",
    "entertainment",
    "tourism.sights",
    "catering.restaurant",
    "catering.cafe",
    "leisure.park"
    
]

for location in TEST_LOCATIONS:
    print("\n")
    print("=" * 70)
    print("CITY:", location["name"])
    print("=" * 70)

    url = "https://api.geoapify.com/v2/places"

    params = {
        "categories": ",".join(CATEGORIES),
        "filter": f'circle:{location["lon"]},{location["lat"]},30000',
        "limit": 50,
        "apiKey": API_KEY
    }

    response = requests.get(url, params=params)
    data = response.json()

    features = data.get("features", [])

    print("FOUND:", len(features))

    all_categories = set()

    for feature in features[:20]:
        props = feature["properties"]

        print("\nNAME:", props.get("name"))

        categories = props.get("categories", [])
        pprint(categories)

        for cat in categories:
            all_categories.add(cat)

    print("\n")
    print("UNIQUE CATEGORIES:")
    pprint(sorted(all_categories))