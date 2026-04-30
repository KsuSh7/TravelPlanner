TAG_MAP = {
    "entertainment.museum": ["museum", "culture"],

    "building.historic": ["history", "architecture"],
    "heritage": ["history"],
    "heritage.unesco": ["history", "culture"],
    "tourism.sights.archaeological_site": ["history"],
    "tourism.sights.ruines": ["history"],

    "religion": ["religion", "culture"],
    "religion.place_of_worship": ["religion"],
    "religion.place_of_worship.christianity": ["religion"],

    "catering.restaurant": ["food"],
    "catering.restaurant.italian": ["food"],
    "park": ["nature", "relax"],

    "tourism.attraction": ["photo_spot"],
    "tourism.sights": ["photo_spot"],

    "building.tourism": ["architecture"],

    "entertainment": ["nightlife", "family"],

    "tourism.sights.memorial": ["history"],
    "catering.cafe": ["food"],
    "leisure.park": ["nature", "relax"],
    "natural": ["nature", "adventure"]
}

def normalize_tags(raw_tags):
    if not raw_tags:
        return ""

    tags = raw_tags.split(",")
    normalized = set()

    for tag in tags:
        tag = tag.strip()

        if tag in TAG_MAP:
            normalized.update(TAG_MAP[tag])

    return ",".join(sorted(normalized))