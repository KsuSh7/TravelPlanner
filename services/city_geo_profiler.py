import re
import wikipediaapi

from extensions import db


wiki = wikipediaapi.Wikipedia(
    user_agent="TravelPlanner/1.0",
    language="en"
)


GEO_KEYWORDS = {
    "beach": [
        "beach",
        "beaches",
        "shore"
    ],

    "coastal": [
        "coast",
        "coastal",
        "seaside",
        "sea",
        "ocean"
    ],

    "island": [
        "island",
        "archipelago"
    ],

    "mountain": [
        "mountain",
        "mountainous",
        "mountains",
        "hill",
        "hills"
    ],

    "forest": [
        "forest",
        "woodland",
        "jungle"
    ],

    "lake": [
        "lake",
        "lakes"
    ],

    "river": [
        "river",
        "riverside"
    ],

    "desert": [
        "desert"
    ],

    "urban": [
        "capital",
        "metropolitan",
        "metropolis",
        "major city"
    ],

    "historical_city": [
        "historic city",
        "historical city",
        "ancient city"
    ]
}


def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-z\s-]", " ", text)
    return text


def extract_geo_tags(summary):
    text = clean_text(summary)

    found_tags = set()

    for tag, keywords in GEO_KEYWORDS.items():
        for word in keywords:
            if word in text:
                found_tags.add(tag)
                break

    return found_tags


def get_city_summary(city):
    """
    Пробує кілька варіантів пошуку у Wikipedia
    """

    variants = [
        city.name,
        f"{city.name} city",
        f"{city.name} travel"
    ]

    for name in variants:
        page = wiki.page(name)

        if page.exists():
            return page.summary

    return ""


def generate_geo_tags(city):
    summary = get_city_summary(city)

    if not summary:
        print(f"No wiki page for {city.name}")
        return set()

    geo_tags = extract_geo_tags(summary)

    print(f"{city.name}: {geo_tags}")

    return geo_tags


def enrich_city(city):
    """
    Додає geo tags до існуючих travel tags
    """

    existing_tags = set()

    if city.tags:
        existing_tags = set(city.tags.split(","))

    geo_tags = generate_geo_tags(city)

    final_tags = existing_tags | geo_tags

    city.tags = ",".join(sorted(final_tags))

    db.session.commit()

    return city.tags