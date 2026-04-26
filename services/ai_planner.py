import math
def generate_ai_plan(user, route):
    plan = []

    places_per_day = math.ceil(len(route) / 3) # тимчасово ділим на 3 - потім треба буде передавати кількість днів подорожі, і ділити на неї

    day = i // places_per_day + 1


    for i, place in enumerate(route):
        if i > 0 and i % places_per_day == 0:
            day += 1

        plan.append({
            "day": day,
            "place": place.name,
            "description": f"Visit {place.name}"
        })

    return plan