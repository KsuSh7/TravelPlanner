def classify_user(profile):

    interests = profile.get("interests", [])

    if "nightlife" in interests:
        return "Party"

    if "museum" in interests or "history" in interests:
        return "Cultural"

    if "nature" in interests:
        return "Explorer"

    if profile.get("travel_type") == "family":
        return "Family"

    return "General"