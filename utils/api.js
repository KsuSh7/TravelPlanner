const API_URL = 'http://192.168.31.54:5000/api';  // додай /api сюди

export async function loginUser(email, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  // Перевір статус
  if (!res.ok) {
    // Якщо 4xx/5xx, спробуємо прочитати json з повідомленням
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Login failed');
  }
  return await res.json();
}

export async function registerUser(username, email, password) {  // username, не name
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Registration failed');
  }
  return await res.json();
}
