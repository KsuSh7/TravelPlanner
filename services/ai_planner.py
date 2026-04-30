import math
import random
from services.recommender import get_places_per_day

PACE_TIME_SLOTS = {
    "slow": ["10:00", "15:00"],
    "medium": ["09:00", "13:00", "17:00", "20:00"],
    "fast": ["08:00", "11:00", "14:00", "17:00", "20:00", "22:00"]
}

TAG_DESCRIPTIONS = {
    "history": [
        "Відвідайте важливі історичні пам’ятки",
        "Пориньте в історію цього місця",
        "Відкрийте для себе історичну спадщину регіону"
    ],
    "culture": [
        "Познайомтеся з місцевою культурою",
        "Відчуйте атмосферу традицій",
        "Дослідіть культурні особливості"
    ],
    "museum": [
        "Завітайте до музейних експозицій",
        "Відкрийте нові факти в музеї",
        "Проведіть час серед експонатів"
    ],
    "architecture": [
        "Помилуйтеся архітектурою",
        "Оцініть архітектурні шедеври",
        "Відкрийте унікальні будівлі"
    ],
    "photo_spot": [
        "Збережіть яскраві моменти на фото",
        "Ідеальне місце для фотографій",
        "Зробіть атмосферні знімки"
    ],
    "food": [
        "Спробуйте місцеву кухню",
        "Відкрийте нові гастрономічні смаки",
        "Насолодіться атмосферою та смачними стравами"
    ],

    "nightlife": [
        "Відчуйте енергію вечірнього міста",
        "Проведіть вечір у яскравій атмосфері",
        "Насолодіться активним нічним життям"
    ],
    "nature": [
        "Насолодіться мальовничою прокулянкою",
        "Вдихніть свіжого повітря",
        "Помилуйтесь неймовірними краєвидами"
    ]
}

USER_TYPE_PREFIX = {
    "Cultural": [
        "Це місце чудово підійде для культурного відкриття.",
        "Ідеальний вибір для знайомства з історією.",
        "Локація з культурною цінністю."
    ],
    "Family": [
        "Прекрасне місце для сімейного відпочинку.",
        "Комфортна локація для всієї родини."
    ],
    "Romantic": [
        "Атмосферне місце для двох.",
        "Романтична локація для прогулянки."
    ],
    "Adventure": [
        "Місце для нових вражень.",
        "Додайте пригод у подорож."
    ],
    "Party": [
        "Чудове місце для активного відпочинку.",
        "Локація з яскравою атмосферою.",
        "Ідеальний вибір для емоційного вечора."
    ],
}


def build_description(place, user_type):
    tags = place.tags.split(",") if place.tags else []

    prefix = random.choice(USER_TYPE_PREFIX.get(user_type, ["Відвідайте це місце."]))

    tag_texts = []
    for tag in tags:
        if tag in TAG_DESCRIPTIONS:
            tag_texts.extend(TAG_DESCRIPTIONS[tag])

    if tag_texts:
        return f"{prefix} {random.choice(tag_texts)}"

    return "Місце, яке варто включити у маршрут"


def get_priority_score(place):
    tags = set(place.tags.split(",")) if place.tags else set()

    if "history" in tags or "museum" in tags:
        return 1
    if "culture" in tags or "architecture" in tags:
        return 2
    return 3


def generate_ai_plan(user, route):
    if not route:
        return []

    pace = user.get("pace", "medium")
    days = user.get("days", 3)

    time_slots = PACE_TIME_SLOTS.get(pace, PACE_TIME_SLOTS["medium"])
    places_per_day = max(get_places_per_day(user), math.ceil(len(route) / days))

    # сортування по пріоритету
    route = sorted(route, key=get_priority_score)

    plan = []

    for i, place in enumerate(route):
        day = i // places_per_day + 1
        day = min(day, days)

        time = time_slots[i % len(time_slots)]

        plan.append({
            "day": day,
            "time": time,
            "place": place.name,
            "description": build_description(place, user.get("user_type", "Cultural"))
        })

    return plan