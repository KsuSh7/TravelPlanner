from collections import Counter

from models import Place
from extensions import db


def generate_city_tags(city):
    places = Place.query.filter_by(city_id=city.id).all()

    counter = Counter()

    for place in places:
        if not place.tags:
            continue

        for tag in place.tags.split(","):
            tag = tag.strip()

            if tag:
                counter[tag] += 1

    top_tags = [
        tag
        for tag, _ in counter.most_common(5)
    ]

    city.tags = ",".join(top_tags)

    db.session.commit()

    return city.tags