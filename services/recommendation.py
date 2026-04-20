from models import Place

def match_interests(user, place):
    user_interests = user.get("interests", [])
    place_tags = place.tags or []

    matches = set(user_interests).intersection(set(place_tags))

    return len(matches) / max(len(user_interests), 1)


def match_budget(user, place):

    user_budget = user.get("budget")

    if user_budget == place.price_level:
        return 1

    if user_budget == "medium" and place.price_level in ["low", "high"]:
        return 0.5

    return 0


def match_travel_type(user, place):

    travel_type = user.get("travel_type")

    if travel_type == "family" and "family" in place.tags:
        return 1

    if travel_type == "solo" and "adventure" in place.tags:
        return 1

    if travel_type == "couple" and "romantic" in place.tags:
        return 1

    return 0.3


def calculate_score(user, place):

    interest_match = match_interests(user, place)
    rating = place.rating / 5
    budget_match = match_budget(user, place)
    travel_match = match_travel_type(user, place)

    score = (
        interest_match * 0.5 +
        rating * 0.3 +
        budget_match * 0.1 +
        travel_match * 0.1
    )

    return score

def get_top_places(user, city_id, limit=5):

    places = Place.query.filter_by(city_id=city_id).all()

    scored_places = []

    for place in places:
        score = calculate_score(user, place)
        scored_places.append((place, score))

    scored_places.sort(key=lambda x: x[1], reverse=True)

    top_places = [place for place, score in scored_places[:limit]]

    return top_places