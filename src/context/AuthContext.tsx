import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Get CSRF token from cookie
  const getCSRFToken = () => {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  // Initialize auth state
  useEffect(() => {
    console.log('Checking localStorage for token...');
    const token = localStorage.getItem('authToken');
    console.log('Token from localStorage:', token);
    
    if (token) {
      console.log('Making verify request with token:', token);
      fetch('http://127.0.0.1:8000/database/api/verify/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      })
      .then(res => {
        console.log('Verify response status:', res.status);
        if (res.status === 401) {
          console.log('Unauthorized, removing token');
          localStorage.removeItem('authToken');
          setUser(null);
          return null;
        }
        return res.json();
      })
      .then(data => {
        console.log('Verify response data:', data);
        if (data && data.user) {
          // Update the token in localStorage with the one from the response
          if (data.user.token) {
            console.log('Updating token in localStorage:', data.user.token);
            localStorage.setItem('authToken', data.user.token);
          }
          setUser({
            id: data.user.id,
            email: data.user.email,
            restaurantId: data.user.restaurantId,
            token: data.user.token,
            restaurantSlug: data.user.restaurantSlug
          });
        } else {
          console.log('No user data in response');
          localStorage.removeItem('authToken');
          setUser(null);
        }
      })
      .catch(error => {
        console.error('Verify error:', error);
        localStorage.removeItem('authToken');
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
    } else {
      console.log('No token found in localStorage');
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => { 
    try {
      console.log('Attempting login...');
      const response = await fetch('http://127.0.0.1:8000/database/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
  
      const data = await response.json();
      console.log('Login response:', data);
      
      if (data.token) {
        console.log('Setting token in localStorage:', data.token);
        localStorage.setItem('authToken', data.token);
      } else {
        console.error('No token received in response');
      }

      setUser({
        id: data.user.id,
        email: data.user.email,
        restaurantId: data.user.restaurantId,
        token: data.token,  // Use the token from the response
        restaurantSlug: data.user.restaurantSlug
      });
  
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed');
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await fetch('http://127.0.0.1:8000/database/api/logout/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};