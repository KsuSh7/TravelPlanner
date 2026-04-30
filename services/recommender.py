
from utils.distance import calculate_distance

INTEREST_WEIGHTS = {
    "history": 3,
    "culture": 3,
    "museum": 2,
    "architecture": 2,
    "food": 2,
    "nature": 2,
    "nightlife": 1,
    "family": 2,
    "romantic": 2,
    "adventure": 2
}

def match_interests(user, place):
    user_interests = set(user.get("interests", []))
    place_tags = set(place.tags.split(",")) if place.tags else set()

    score = 0

    for tag in user_interests.intersection(place_tags):
        score += INTEREST_WEIGHTS.get(tag, 1)

    max_possible = sum(
        INTEREST_WEIGHTS.get(tag, 1)
        for tag in user_interests
    )

    if max_possible == 0:
        return 0

    return score / max_possible


def match_budget(user, place):
    user_budget = user.get("budget")
    place_budget = place.price_level

    if user_budget == place_budget:
        return 1

    if user_budget == "medium":
        return 0.5

    return 0


def match_travel_type(user, place):
    travel_type = user.get("travel_type")
    place_tags = set(place.tags.split(",")) if place.tags else set()

    mapping = {
        "family": "family",
        "solo": "adventure",
        "couple": "romantic"
    }

    needed_tag = mapping.get(travel_type)

    if needed_tag in place_tags:
        return 1

    return 0.3


def calculate_score(user, place):
    interest_match = match_interests(user, place)
    rating_score = (place.rating or 4) / 5
    budget_match = match_budget(user, place)
    travel_match = match_travel_type(user, place)

    pace_match = match_pace(user, place)

    score = (
        interest_match * 0.40 +
        rating_score * 0.25 +
        budget_match * 0.10 +
        travel_match * 0.10 +
        pace_match * 0.15
    )

    return round(score, 3)


def get_best_places(places, user, limit=10):
    selected = []
    remaining = places.copy()

    while remaining and len(selected) < limit:
        best = max(
            remaining,
            key=lambda place:
                calculate_score(user, place) * 0.85
                + match_distance(place, selected) * 0.15
        )

        selected.append(best)
        remaining.remove(best)

    return selected

def match_pace(user, place):
    pace = user.get("pace")
    place_tags = set(place.tags.split(",")) if place.tags else set()

    slow_tags = {
        "nature",
        "relax",
        "museum",
        "culture",
        "photo_spot",
        "religion"
    }

    fast_tags = {
        "nightlife",
        "food",
        "architecture",
        "entertainment"
    }

    if pace == "slow":
        if place_tags & slow_tags:
            return 1
        return 0.4

    if pace == "medium":
        return 0.8

    if pace == "fast":
        if place_tags & fast_tags:
            return 1
        return 0.4

    return 0.5

def get_places_per_day(user):
    pace = user.get("pace", "medium")

    if pace == "slow":
        return 2

    if pace == "medium":
        return 4

    if pace == "fast":
        return 6

    return 4

def match_distance(place, selected_places):
    if not selected_places:
        return 1

    nearest = min(
        calculate_distance(place, p)
        for p in selected_places
    )

    if nearest < 1:
        return 1

    if nearest < 3:
        return 0.8

    if nearest < 5:
        return 0.5

    return 0.2