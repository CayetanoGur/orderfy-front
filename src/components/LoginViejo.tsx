
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginCredentials } from '../types';

function getCookie(name: string) {
  const cookieArr = document.cookie.split(';');
  for (let i = 0; i < cookieArr.length; i++) {
    const cookiePair = cookieArr[i].trim();
    if (cookiePair.startsWith(name + '=')) {
      return decodeURIComponent(cookiePair.substring(name.length + 1));
    }
  }
  console.log('Cookie not found:', name);
  console.log('Cookies:', document.cookie);
  return null;
}
const Login: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({ username: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const csrfToken = getCookie('csrftoken') || ''; // Get the CSRF token from the cookies
  console.log('CSRF token:', csrfToken);
  console.log('credential:',credentials);
  try {
    const response = await fetch('http://127.0.0.1:8000/database/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken, // Ensure csrfToken is a string
      },
      credentials: 'include', // Asegúrate de que se envían las cookies con la solicitud
      body: JSON.stringify(credentials),
    });
    
    console.log('response:', response);
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } else {
      alert('Login failed. Please try again.');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('An error occurred. Please try again.');
  }
};

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Restaurant Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block mb-1">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-1">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors duration-300"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
