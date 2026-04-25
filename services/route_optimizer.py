from utils.distance import calculate_distance

def build_route(places):

    if not places:
        return []

    route = [places[0]]
    remaining = places[1:]

    while remaining:

        last = route[-1]

        next_place = min(
            remaining,
            key=lambda p: calculate_distance(last, p)
        )

        route.append(next_place)
        remaining.remove(next_place)

    return route