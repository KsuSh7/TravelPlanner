const API_URL = 'http://192.168.31.55:5001/api';  // додай /api сюди

export async function loginUser(email, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Login failed');
  }
  return await res.json();
}

export async function registerUser(username, email, password) {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
  
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('Server returned non-JSON response');
      }
  
      console.log('Parsed JSON data:', data);
  
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Registration failed');
      }
  
      if (!data.token) {
        return data;
      }
  
      return data; // { token: "..." }
    } catch (error) {
      throw new Error(error.message || 'Unexpected error');
    }
}
  
  
  
