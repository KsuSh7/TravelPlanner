import json

# Задаємо поля, які хочемо залишити
needed_fields = ['id', 'name', 'country_code', 'latitude', 'longitude']

# Відкриваємо оригінальний файл
with open('cities.json', 'r', encoding='utf-8') as f:
    cities = json.load(f)

# Створюємо новий список з відфільтрованими даними
filtered_cities = []
for city in cities:
    filtered_city = {key: city[key] for key in needed_fields if key in city}
    filtered_cities.append(filtered_city)

# За бажанням — зберігаємо у новий файл
with open('filtered_cities.json', 'w', encoding='utf-8') as f:
    json.dump(filtered_cities, f, indent=4)

print("Фільтрація завершена, збережено у 'filtered_cities.json'")
