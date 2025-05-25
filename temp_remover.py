import sqlite3

conn = sqlite3.connect('database.db')
cursor = conn.cursor()

cursor.execute("DROP TABLE IF EXISTS _alembic_tmp_trip")
conn.commit()
conn.close()

print("Тимчасова таблиця _alembic_tmp_trip видалена")
