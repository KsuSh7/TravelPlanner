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

    score = (
        interest_match * 0.5 +
        rating_score * 0.3 +
        budget_match * 0.1 +
        travel_match * 0.1
    )

    return round(score, 3)


def get_best_places(places, user, limit=10):
    scored = sorted(
        places,
        key=lambda place: calculate_score(user, place),
        reverse=True
    )

    return scored[:limit]